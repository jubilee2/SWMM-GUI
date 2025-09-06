const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

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

// Fallback to index.html for SPA routing
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
