import path from 'path';
import { describe, it, expect } from 'vitest';

import { parseReport, ReportParseError } from '../server/reportParser';

const dataDir = __dirname;

describe('parseReport', () => {
  it('parses required fields from a report file', () => {
    const file = path.join(dataDir, 'data', 'sample-report.rpt');
    const result = parseReport(file);
    expect(result).toEqual({
      inpFile: 'sample.inp',
      startDate: '01/01/2024 00:00:00',
      endDate: '01/01/2024 01:00:00',
      flowUnits: 'CFS',
      totals: {
        inflow: 12.5,
        outflow: 11.75,
        peakFlow: 3.2,
      },
    });
  });

  it('throws when a required field is missing', () => {
    const file = path.join(dataDir, 'data', 'missing-field-report.rpt');
    expect(() => parseReport(file)).toThrow(ReportParseError);
    expect(() => parseReport(file)).toThrow(/Missing required field: Total Outflow/);
  });

  it('throws when numeric fields cannot be parsed', () => {
    const file = path.join(dataDir, 'data', 'invalid-number-report.rpt');
    expect(() => parseReport(file)).toThrow(ReportParseError);
    expect(() => parseReport(file)).toThrow(/Invalid numeric value for Total Inflow/);
  });

  it('throws when report file is empty', () => {
    const file = path.join(dataDir, 'data', 'empty-report.rpt');
    expect(() => parseReport(file)).toThrow(ReportParseError);
    expect(() => parseReport(file)).toThrow(/Report file is empty/);
  });
});
