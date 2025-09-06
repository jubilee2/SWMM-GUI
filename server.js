const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Path to compiled frontend
const distPath = path.join(__dirname, 'client', 'dist');
app.use(express.static(distPath));

// Endpoint serving fixed SWMM output file
app.get('/api/output', (req, res) => {
  res.sendFile(path.join(__dirname, 'swmm-output.txt'));
});

// Fallback to index.html for SPA routing
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
