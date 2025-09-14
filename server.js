const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { parseInp } = require('./server/inpParser');
const { connectToDatabase } = require('./server/db');

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

// Parse uploaded INP file
app.post('/api/parse', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const ext = path.extname(req.file.originalname).toLowerCase();
  if (ext !== '.inp') {
    fs.unlink(req.file.path, () => {});
    return res.status(400).json({ error: 'Unsupported file type' });
  }
  try {
    const result = parseInp(req.file.path);
    fs.unlink(req.file.path, () => {});
    if (!result || Object.keys(result).length === 0) {
      return res.status(422).json({ error: 'Invalid or empty INP file' });
    }
    res.json(result);
  } catch (err) {
    res.status(422).json({ error: `Parsing failed: ${err.message}` });
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
      });
    })
    .catch((err) => {
      console.error('Failed to connect to MongoDB', err);
      process.exit(1);
    });
}

module.exports = app;
