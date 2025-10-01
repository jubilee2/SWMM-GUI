const fs = require('fs');

class ReportParseError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ReportParseError';
  }
}

const ELEMENT_COUNT_LABELS = {
  'Number of rain gages': 'rainGages',
  'Number of subcatchments': 'subcatchments',
  'Number of nodes': 'nodes',
  'Number of links': 'links',
  'Number of pollutants': 'pollutants',
  'Number of land uses': 'landUses',
};

const PROCESS_MODEL_LABELS = new Set([
  'Rainfall/Runoff',
  'RDII',
  'Snowmelt',
  'Groundwater',
  'Flow Routing',
  'Ponding Allowed',
  'Water Quality',
]);

const FLOW_ROUTING_LABELS = {
  'Dry Weather Inflow': {
    key: 'dryWeatherInflow',
    fields: ['hectareMeters', 'millionLiters'],
  },
  'Wet Weather Inflow': {
    key: 'wetWeatherInflow',
    fields: ['hectareMeters', 'millionLiters'],
  },
  'Groundwater Inflow': {
    key: 'groundwaterInflow',
    fields: ['hectareMeters', 'millionLiters'],
  },
  'RDII Inflow': {
    key: 'rdiiInflow',
    fields: ['hectareMeters', 'millionLiters'],
  },
  'External Inflow': {
    key: 'externalInflow',
    fields: ['hectareMeters', 'millionLiters'],
  },
  'External Outflow': {
    key: 'externalOutflow',
    fields: ['hectareMeters', 'millionLiters'],
  },
  'Flooding Loss': {
    key: 'floodingLoss',
    fields: ['hectareMeters', 'millionLiters'],
  },
  'Evaporation Loss': {
    key: 'evaporationLoss',
    fields: ['hectareMeters', 'millionLiters'],
  },
  'Exfiltration Loss': {
    key: 'exfiltrationLoss',
    fields: ['hectareMeters', 'millionLiters'],
  },
  'Initial Stored Volume': {
    key: 'initialStoredVolume',
    fields: ['hectareMeters', 'millionLiters'],
  },
  'Final Stored Volume': {
    key: 'finalStoredVolume',
    fields: ['hectareMeters', 'millionLiters'],
  },
  'Continuity Error (%)': {
    key: 'continuityErrorPercent',
    fields: ['percent'],
  },
};

function parseReport(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (!content.trim()) {
    throw new ReportParseError('Report file is empty');
  }

  const lines = content.split(/\r?\n/);

  const elementCountLines = collectSection(lines, 'Element Count');
  const nodeSummaryLines = collectSection(lines, 'Node Summary');
  const linkSummaryLines = collectSection(lines, 'Link Summary');
  const crossSectionLines = collectSection(lines, 'Cross Section Summary');
  const analysisOptionsLines = collectSection(lines, 'Analysis Options');
  const flowRoutingLines = collectSection(lines, 'Flow Routing Continuity');

  return {
    elementCount: parseElementCount(elementCountLines),
    nodeSummary: parseNodeSummary(nodeSummaryLines),
    linkSummary: parseLinkSummary(linkSummaryLines),
    crossSectionSummary: parseCrossSectionSummary(crossSectionLines),
    analysisOptions: parseAnalysisOptions(analysisOptionsLines),
    flowRoutingContinuity: parseFlowRoutingContinuity(flowRoutingLines),
  };
}

function collectSection(lines, title) {
  const index = lines.findIndex((line) => line.includes(title));
  if (index === -1) {
    throw new ReportParseError(`Missing section: ${title}`);
  }

  let start = index + 1;
  while (start < lines.length && isDecorativeLine(lines[start])) {
    start += 1;
  }
  while (start < lines.length && !lines[start].trim()) {
    start += 1;
  }

  const section = [];
  for (let i = start; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.trim()) {
      const next = findNextNonEmpty(lines, i + 1);
      if (next === -1 || /^\s*\*+/.test(lines[next])) {
        break;
      }
      break;
    }
    if (/^\s*\*+/.test(line) && i > start) {
      break;
    }
    section.push(line);
  }

  if (!section.length) {
    throw new ReportParseError(`Section ${title} is empty`);
  }

  return section;
}

function findNextNonEmpty(lines, start) {
  for (let i = start; i < lines.length; i += 1) {
    if (lines[i].trim()) {
      return i;
    }
  }
  return -1;
}

function isDecorativeLine(line) {
  return /^\s*[\*\-]+/.test(line || '');
}

function parseElementCount(lines) {
  const result = {};
  for (const line of lines) {
    const match = line.match(/^\s*(.*?)\s*\.{3,}\s*(.+?)\s*$/);
    if (!match) {
      continue;
    }
    const label = match[1].trim();
    const key = ELEMENT_COUNT_LABELS[label];
    if (!key) {
      continue;
    }
    const rawValue = match[2].trim();
    const value = Number(rawValue);
    if (!Number.isFinite(value)) {
      throw new ReportParseError(`Invalid numeric value for ${label}`);
    }
    result[key] = value;
  }

  for (const [label, key] of Object.entries(ELEMENT_COUNT_LABELS)) {
    if (result[key] === undefined) {
      throw new ReportParseError(`Missing required element count: ${label}`);
    }
  }

  return result;
}

function parseNodeSummary(lines) {
  const dataLines = lines.filter(
    (line) =>
      line.trim() &&
      !/^Name\s+/i.test(line.trim()) &&
      !/^Inve/i.test(line.trim()) &&
      !/^[-]+$/.test(line.trim()) &&
      !/^[-]+\s+[-]+/.test(line.trim()) &&
      !/^External$/i.test(line.trim())
  );

  return dataLines.map((line) => {
    const parts = line.trim().split(/\s{2,}/);
    return {
      name: parts[0] || null,
      type: parts[1] || null,
      invertElevation: toNumberOrNull(parts[2]),
      maxDepth: toNumberOrNull(parts[3]),
      pondedArea: toNumberOrNull(parts[4]),
      externalInflow: toNumberOrNull(parts[5]),
    };
  });
}

function parseLinkSummary(lines) {
  const dataLines = lines.filter((line) => line.trim() && !/^Name\s+/i.test(line.trim()) && !/^[-]+/.test(line.trim()));

  return dataLines.map((line) => {
    const parts = line.trim().split(/\s{2,}/);
    return {
      name: parts[0] || null,
      fromNode: parts[1] || null,
      toNode: parts[2] || null,
      type: parts[3] || null,
      length: toNumberOrNull(parts[4]),
      percentSlope: toNumberOrNull(parts[5]),
      roughness: toNumberOrNull(parts[6]),
    };
  });
}

function parseCrossSectionSummary(lines) {
  const dataLines = lines.filter((line) => {
    const trimmed = line.trim();
    return trimmed && !/^Conduit\s+/i.test(trimmed) && !/^Full\s+/i.test(trimmed) && !/^[-]+/.test(trimmed);
  });

  return dataLines.map((line) => {
    const parts = line.trim().split(/\s{2,}/);
    return {
      conduit: parts[0] || null,
      shape: parts[1] || null,
      fullDepth: toNumberOrNull(parts[2]),
      fullArea: toNumberOrNull(parts[3]),
      hydraulicRadius: toNumberOrNull(parts[4]),
      maxWidth: toNumberOrNull(parts[5]),
      barrels: toNumberOrNull(parts[6]),
      fullFlow: toNumberOrNull(parts[7]),
    };
  });
}

function parseAnalysisOptions(lines) {
  const options = {};
  let processModels = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('Process Models')) {
      processModels = {};
      continue;
    }

    const match = trimmed.match(/^(.*?)\.{3,}\s*(.+?)\s*$/);
    if (!match) {
      continue;
    }

    const label = match[1].trim();
    const value = match[2].trim();
    const key = toCamelCase(label.replace(/\(.*?\)/g, '').trim());

    if (processModels !== null) {
      if (PROCESS_MODEL_LABELS.has(label)) {
        processModels[key] = normalizeValue(value);
        continue;
      }
      options.processModels = processModels;
      processModels = null;
    }

    options[key] = normalizeValue(value);
  }

  if (processModels !== null) {
    options.processModels = processModels;
  }

  return options;
}

function parseFlowRoutingContinuity(lines) {
  const continuity = {};

  for (const line of lines) {
    const match = line.match(/^(.*?)\.{3,}\s*(-?\d+(?:\.\d+)?)(?:\s+(-?\d+(?:\.\d+)?))?/);
    if (!match) {
      continue;
    }

    const label = match[1].trim();
    const descriptor = FLOW_ROUTING_LABELS[label];
    if (!descriptor) {
      continue;
    }

    const [, , firstValue, secondValue] = match;
    const { key, fields } = descriptor;

    if (fields.length === 1) {
      const numericValue = Number(firstValue);
      if (!Number.isFinite(numericValue)) {
        throw new ReportParseError(`Invalid continuity value for ${label}`);
      }
      continuity[key] = numericValue;
    } else {
      if (secondValue === undefined) {
        throw new ReportParseError(`Missing continuity value for ${label}`);
      }
      const firstNumeric = Number(firstValue);
      const secondNumeric = Number(secondValue);
      if (!Number.isFinite(firstNumeric) || !Number.isFinite(secondNumeric)) {
        throw new ReportParseError(`Invalid continuity value for ${label}`);
      }
      continuity[key] = {
        [fields[0]]: firstNumeric,
        [fields[1]]: secondNumeric,
      };
    }
  }

  for (const label of Object.keys(FLOW_ROUTING_LABELS)) {
    const key = FLOW_ROUTING_LABELS[label].key;
    if (continuity[key] === undefined) {
      throw new ReportParseError(`Missing continuity metric: ${label}`);
    }
  }

  return continuity;
}

function toNumberOrNull(value) {
  if (value == null || value === '') {
    return null;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function normalizeValue(value) {
  if (value === '') return '';
  const normalized = value.replace(/,/g, '').trim();
  if (/^-?\d+(?:\.\d+)?$/.test(normalized)) {
    return Number(normalized);
  }
  return value;
}

function toCamelCase(label) {
  const segments = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/);
  if (!segments.length) return '';
  return segments
    .map((segment, index) =>
      index === 0 ? segment : segment.charAt(0).toUpperCase() + segment.slice(1)
    )
    .join('');
}

module.exports = { parseReport, ReportParseError };
