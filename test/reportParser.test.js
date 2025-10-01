import path from 'path';
import { describe, it, expect } from 'vitest';

import { parseReport, ReportParseError } from '../server/reportParser';

const dataDir = __dirname;

describe('parseReport', () => {
  it('parses element counts, summaries, and continuity metrics from a report file', () => {
    const file = path.join(dataDir, 'data', 'sample-report.rpt');
    const result = parseReport(file);

    expect(result.elementCount).toEqual({
      rainGages: 0,
      subcatchments: 0,
      nodes: 381,
      links: 364,
      pollutants: 0,
      landUses: 0,
    });

    expect(result.nodeSummary.length).toBeGreaterThan(0);
    expect(result.nodeSummary[0]).toMatchObject({
      name: 'S9',
      type: 'JUNCTION',
      invertElevation: 5.31,
      maxDepth: 3.99,
      pondedArea: 0,
      externalInflow: null,
    });

    expect(result.linkSummary[0]).toMatchObject({
      name: 'S9-S8',
      fromNode: 'S9',
      toNode: 'S8',
      type: 'CONDUIT',
      length: 179.9,
      percentSlope: 0.3502,
      roughness: 0.015,
    });

    expect(result.crossSectionSummary[0]).toMatchObject({
      conduit: 'S9-S8',
      shape: 'CIRCULAR',
      fullDepth: 0.8,
      fullArea: 0.5,
    });

    expect(result.analysisOptions.flowUnits).toBe('CMS');
    expect(result.analysisOptions.maximumTrials).toBe(8);
    expect(result.analysisOptions.processModels).toMatchObject({
      rainfallRunoff: 'NO',
      flowRouting: 'YES',
      pondingAllowed: 'YES',
    });

    expect(result.flowRoutingContinuity.externalInflow).toEqual({
      hectareMeters: 0.26,
      millionLiters: 2.602,
    });
    expect(result.flowRoutingContinuity.continuityErrorPercent).toBeCloseTo(1.078, 3);
  });

  it('throws when a required element count is missing', () => {
    const file = path.join(dataDir, 'data', 'missing-field-report.rpt');
    expect(() => parseReport(file)).toThrow(ReportParseError);
    expect(() => parseReport(file)).toThrow(/Missing required element count: Number of links/);
  });

  it('throws when numeric fields cannot be parsed', () => {
    const file = path.join(dataDir, 'data', 'invalid-number-report.rpt');
    expect(() => parseReport(file)).toThrow(ReportParseError);
    expect(() => parseReport(file)).toThrow(/Invalid numeric value for Number of nodes/);
  });

  it('throws when report file is empty', () => {
    const file = path.join(dataDir, 'data', 'empty-report.rpt');
    expect(() => parseReport(file)).toThrow(ReportParseError);
    expect(() => parseReport(file)).toThrow(/Report file is empty/);
  });
});
