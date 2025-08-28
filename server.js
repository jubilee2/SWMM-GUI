const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

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

const { exec } = require('child_process');

// Endpoint to run a SWMM simulation
app.post('/api/run_swmm', (req, res) => {
  const inputFile = req.body.inputFile; // e.g., 'Example1.inp'
  if (!inputFile) {
    return res.status(400).json({ error: 'inputFile is required.' });
  }

  const inputFilePath = path.join(uploadsDir, inputFile);
  const reportFilePath = path.join(uploadsDir, inputFile.replace('.inp', '.rpt'));
  const outputFilePath = path.join(uploadsDir, inputFile.replace('.inp', '.out'));

  // Check if the input file exists
  if (!fs.existsSync(inputFilePath)) {
    return res.status(404).json({ error: 'Input file not found.' });
  }

  // NOTE: This assumes 'swmm5.exe' is in the system's PATH or in the project root.
  // For Linux/macOS, the executable might be named 'swmm5'.
  const command = `swmm5 ${JSON.stringify(inputFilePath)} ${JSON.stringify(reportFilePath)} ${JSON.stringify(outputFilePath)}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).json({
        error: 'Failed to run SWMM simulation.',
        details: stderr
      });
    }

    console.log(`stdout: ${stdout}`);
    res.json({
      message: 'SWMM simulation completed successfully!',
      reportFile: path.basename(reportFilePath),
      outputFile: path.basename(outputFilePath),
      log: stdout
    });
  });
});


app.get('/', (req, res) => {
  res.send('Hello World! The server is running.');
});

// Endpoint to parse coordinates from an .inp file
app.get('/api/mapdata/:fileName', (req, res) => {
    const fileName = req.params.fileName;

    // Basic security
    if (fileName.includes('..')) {
        return res.status(400).json({ error: 'Invalid file name.' });
    }

    const filePath = path.join(uploadsDir, fileName);
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Input file not found.' });
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.split(/\r?\n/);

    let inCoordinatesSection = false;
    const features = [];

    for (const line of lines) {
        if (line.trim().toLowerCase() === '[coordinates]') {
            inCoordinatesSection = true;
            continue;
        }
        if (line.trim().startsWith('[')) {
            // Stop if we hit another section
            if (inCoordinatesSection) break;
            continue;
        }

        if (inCoordinatesSection && line.trim() && !line.trim().startsWith(';')) {
            const parts = line.trim().split(/\s+/);
            // Node         X-Coord            Y-Coord
            if (parts.length >= 3) {
                const [name, x, y] = parts;
                features.push({
                    type: 'Feature',
                    properties: { name: name },
                    geometry: {
                        type: 'Point',
                        // Note: GeoJSON is [longitude, latitude], but SWMM is often projected.
                        // We are assuming X=lon, Y=lat for now. This might need adjustment.
                        coordinates: [parseFloat(x), parseFloat(y)]
                    }
                });
            }
        }
    }

    res.json({
        type: 'FeatureCollection',
        features: features
    });
});

// Endpoint to get a result file
app.get('/api/results/:fileName', (req, res) => {
    const fileName = req.params.fileName;

    // Basic security: prevent directory traversal
    if (fileName.includes('..')) {
        return res.status(400).send('Invalid file name.');
    }

    const filePath = path.join(uploadsDir, fileName);

    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('File not found.');
    }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
