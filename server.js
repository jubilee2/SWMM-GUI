const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir);
}

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Use the original file name
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

// Endpoint to handle file upload
app.post('/api/upload', upload.single('swmmFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }
  res.json({ message: 'File uploaded successfully!', file: req.file.originalname });
});


app.get('/', (req, res) => {
  res.send('Hello World! The server is running.');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
