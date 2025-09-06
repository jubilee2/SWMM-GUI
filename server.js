const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { parseInp } = require('./server/inpParser');

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
  try {
    const result = parseInp(req.file.path);
    fs.unlink(req.file.path, () => {});
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: 'Parsing failed' });
  }
});

// Fallback to index.html for SPA routing
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
