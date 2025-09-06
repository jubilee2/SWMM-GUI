// Basic INP parser inspired by SWMM's Uimport.pas and swmm-online parser
const SECTION_REGEX = /^\[(.+)\]$/;

function parseInp(content) {
  const lines = content.split(/\r?\n/);
  const result = { nodes: [], links: [] };
  const coords = {};
  let section = null;

  for (const raw of lines) {
    const line = raw.split(';')[0].trim();
    if (!line) continue;
    const match = SECTION_REGEX.exec(line);
    if (match) {
      section = match[1].toUpperCase();
      continue;
    }
    const parts = line.split(/\s+/);
    switch (section) {
      case 'JUNCTIONS':
      case 'OUTFALLS':
      case 'STORAGE':
        result.nodes.push({
          id: parts[0],
          attrs: parts.slice(1),
        });
        break;
      case 'CONDUITS':
      case 'PUMPS':
      case 'OUTLETS':
        result.links.push({
          id: parts[0],
          from: parts[1],
          to: parts[2],
          attrs: parts.slice(3),
        });
        break;
      case 'COORDINATES':
        coords[parts[0]] = { x: parseFloat(parts[1]), y: parseFloat(parts[2]) };
        break;
      default:
        break;
    }
  }

  result.nodes = result.nodes.map((n) => ({ ...n, ...coords[n.id] }));
  return result;
}

module.exports = { parseInp };
