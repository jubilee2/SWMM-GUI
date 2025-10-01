const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { ObjectId } = require('mongodb');
const { parseInp } = require('./server/inpParser');
const { parseReport, ReportParseError } = require('./server/reportParser');
const { connectToDatabase, getDb } = require('./server/db');

const app = express();
const PORT = process.env.PORT || 3000;
const upload = multer({ dest: 'uploads/' });

// Path to compiled frontend
const distPath = path.join(__dirname, 'client', 'dist');
app.use(express.static(distPath));

// Endpoint serving fixed SWMM output file
app.get('/api/output', (req, res) => {
  const filePath = path.join(__dirname, 'swmm-output.txt');
  fs.access(filePath, fs.constants.R_OK, (err) => {
    if (err) {
      return res.status(404).send('Output file not found');
    }
    res.sendFile(filePath);
  });
});

// Parse uploaded INP file and persist result
app.post('/api/parse', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const ext = path.extname(req.file.originalname).toLowerCase();
  if (ext !== '.inp') {
    fs.unlink(req.file.path, () => {});
    return res.status(400).json({ error: 'Unsupported file type' });
  }
  const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
  if (!title) {
    fs.unlink(req.file.path, () => {});
    return res.status(400).json({ error: 'Title is required' });
  }
  try {
    const result = parseInp(req.file.path);
    fs.unlink(req.file.path, () => {});
    if (!result || Object.keys(result).length === 0) {
      return res.status(422).json({ error: 'Invalid or empty INP file' });
    }
    try {
      const db = getDb();
      await db.collection('parses').insertOne({
        filename: req.file.originalname,
        title,
        uploadedAt: new Date(),
        data: result,
      });
    } catch (err) {
      console.error('Failed to save to database', err);
    }
    res.json(result);
  } catch (err) {
    res.status(422).json({ error: `Parsing failed: ${err.message}` });
  }
});

app.post('/api/inp-files/:id/report', upload.single('file'), async (req, res) => {
  const cleanup = () => {
    if (req.file?.path) {
      fs.unlink(req.file.path, () => {});
    }
  };

  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    cleanup();
    return res.status(400).json({ error: 'Invalid INP file id' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No report uploaded' });
  }

  const ext = path.extname(req.file.originalname).toLowerCase();
  if (ext !== '.rpt') {
    cleanup();
    return res.status(400).json({ error: 'Unsupported report type' });
  }

  let parsedReport;
  try {
    parsedReport = parseReport(req.file.path);
  } catch (err) {
    cleanup();
    if (err instanceof ReportParseError) {
      return res.status(422).json({ error: err.message });
    }
    console.error('Failed to parse report', err);
    return res.status(500).json({ error: 'Failed to parse report' });
  }

  const savedReport = {
    ...parsedReport,
    filename: req.file.originalname,
    uploadedAt: new Date(),
  };

  try {
    const db = getDb();
    const result = await db.collection('parses').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { report: savedReport } },
      { returnDocument: 'after' }
    );
    cleanup();

    if (!result?.value) {
      return res.status(404).json({ error: 'INP file not found' });
    }

    return res.json(result.value.report);
  } catch (err) {
    cleanup();
    console.error('Failed to save report', err);
    return res.status(500).json({ error: 'Failed to save report' });
  }
});

app.get('/api/inp-files', async (req, res) => {
  try {
    const db = getDb();
    const files = await db
      .collection('parses')
      .find({}, { projection: { title: 1, filename: 1, uploadedAt: 1 } })
      .sort({ uploadedAt: -1 })
      .toArray();
    res.json(files);
  } catch (err) {
    console.error('Failed to fetch INP files', err);
    res.status(500).json({ error: 'Failed to fetch INP files' });
  }
});

app.get('/api/inp-files/:id', async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid INP file id' });
  }

  try {
    const db = getDb();
    const file = await db
      .collection('parses')
      .findOne({ _id: new ObjectId(id) }, { projection: { data: 1, title: 1, filename: 1, uploadedAt: 1 } });

    if (!file) {
      return res.status(404).json({ error: 'INP file not found' });
    }

    return res.json(file);
  } catch (err) {
    console.error('Failed to load INP file', err);
    return res.status(500).json({ error: 'Failed to load INP file' });
  }
});

app.delete('/api/inp-files/:id', async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid INP file id' });
  }

  try {
    const db = getDb();
    const result = await db.collection('parses').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'INP file not found' });
    }
    return res.status(204).send();
  } catch (err) {
    console.error('Failed to delete INP file', err);
    return res.status(500).json({ error: 'Failed to delete INP file' });
  }
});

// Fallback to index.html for SPA routing
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

if (require.main === module) {
  connectToDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      }).on('error', (err) => {
        console.error('Failed to start server', err);
        process.exit(1);
      });
    })
    .catch((err) => {
      console.error('Failed to connect to MongoDB', err);
      process.exit(1);
    });
}

module.exports = app;
