const fs = require('fs');

function trimComments(line) {
  const idx = line.indexOf(';');
  return idx >= 0 ? line.slice(0, idx).trim() : line.trim();
}

function tokenize(line) {
  return line.split(/\s+/).filter(Boolean);
}

function parseInp(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  const sections = {};
  let currentSection = null;

  const converters = {
    COORDINATES: (t) => ({ id: t[0], x: parseFloat(t[1]), y: parseFloat(t[2]) }),
    JUNCTIONS: (t) => ({
      id: t[0],
      elev: parseFloat(t[1]),
      depth: parseFloat(t[2]),
      surDepth: parseFloat(t[3]),
      apond: parseFloat(t[4]),
    }),
    CONDUITS: (t) => ({
      id: t[0],
      from: t[1],
      to: t[2],
      length: parseFloat(t[3]),
      roughness: parseFloat(t[4]),
      inOffset: parseFloat(t[5]),
      outOffset: parseFloat(t[6]),
      initFlow: parseFloat(t[7]),
      maxFlow: parseFloat(t[8]),
    }),
  };

  for (const rawLine of lines) {
    const line = trimComments(rawLine);
    if (!line) continue;
    const sectionMatch = line.match(/^\[(.+?)\]$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1].toUpperCase();
      if (!sections[currentSection]) {
        sections[currentSection] = [];
      }
      continue;
    }
    if (currentSection) {
      const tokens = tokenize(line);
      const convert = converters[currentSection];
      sections[currentSection].push(convert ? convert(tokens) : tokens);
    }
  }

  return sections;
}

module.exports = { parseInp, tokenize, trimComments };
