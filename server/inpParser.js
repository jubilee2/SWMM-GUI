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
      sections[currentSection].push(tokenize(line));
    }
  }

  return sections;
}

module.exports = { parseInp, tokenize, trimComments };
