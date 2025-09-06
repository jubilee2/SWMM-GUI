const fs = require('fs');

function parseInp(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, content) => {
      if (err) return reject(err);
      const lines = content.split(/\r?\n/);
      const data = {};
      const coordinates = {};
      const vertices = {};
      let currentSection = null;

      for (const raw of lines) {
        const line = raw.trim();
        if (!line || line.startsWith(';')) continue;
        const sectionMatch = line.match(/^\[(.+)\]$/);
        if (sectionMatch) {
          currentSection = sectionMatch[1];
          if (!data[currentSection]) data[currentSection] = [];
          continue;
        }
        if (!currentSection) continue;
        const tokens = line.split(/\s+/);
        data[currentSection].push(tokens);
        if (currentSection === 'COORDINATES') {
          const [id, x, y] = tokens;
          coordinates[id] = { x: parseFloat(x), y: parseFloat(y) };
        } else if (currentSection === 'VERTICES') {
          const [id, x, y] = tokens;
          if (!vertices[id]) vertices[id] = [];
          vertices[id].push({ x: parseFloat(x), y: parseFloat(y) });
        }
      }

      data.coordinates = coordinates;
      data.vertices = vertices;
      resolve(data);
    });
  });
}

module.exports = { parseInp };
