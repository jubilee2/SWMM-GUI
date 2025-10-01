const fs = require('fs');

class ReportParseError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ReportParseError';
  }
}

const FIELD_MAP = {
  'INP File': {
    key: 'inpFile',
    parser: (value) => parseText('INP File', value),
  },
  'Start Date': {
    key: 'startDate',
    parser: (value) => parseText('Start Date', value),
  },
  'End Date': {
    key: 'endDate',
    parser: (value) => parseText('End Date', value),
  },
  'Flow Units': {
    key: 'flowUnits',
    parser: (value) => parseText('Flow Units', value),
  },
  'Total Inflow': {
    key: 'totalInflow',
    parser: (value) => parseNumber('Total Inflow', value),
  },
  'Total Outflow': {
    key: 'totalOutflow',
    parser: (value) => parseNumber('Total Outflow', value),
  },
  'Peak Flow': {
    key: 'peakFlow',
    parser: (value) => parseNumber('Peak Flow', value),
  },
};

function parseText(field, value) {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) {
    throw new ReportParseError(`${field} is empty`);
  }
  return trimmed;
}

function parseNumber(field, value) {
  const number = Number(String(value ?? '').trim());
  if (!Number.isFinite(number)) {
    throw new ReportParseError(`Invalid numeric value for ${field}`);
  }
  return number;
}

function parseReport(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (!content.trim()) {
    throw new ReportParseError('Report file is empty');
  }

  const collected = {};
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const match = line.match(/^([^:]+):\s*(.+)$/);
    if (!match) continue;
    const label = match[1].trim();
    const value = match[2];
    const field = FIELD_MAP[label];
    if (field && !(field.key in collected)) {
      collected[field.key] = field.parser(value);
    }
  }

  for (const [label, { key }] of Object.entries(FIELD_MAP)) {
    if (collected[key] === undefined) {
      throw new ReportParseError(`Missing required field: ${label}`);
    }
  }

  return {
    inpFile: collected.inpFile,
    startDate: collected.startDate,
    endDate: collected.endDate,
    flowUnits: collected.flowUnits,
    totals: {
      inflow: collected.totalInflow,
      outflow: collected.totalOutflow,
      peakFlow: collected.peakFlow,
    },
  };
}

module.exports = { parseReport, ReportParseError };
