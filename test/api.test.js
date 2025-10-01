import fs from 'fs';
import path from 'path';
import request from 'supertest';
import { describe, it, expect, vi, afterEach } from 'vitest';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('POST /api/parse', () => {
  it('parses uploaded INP file and saves result', async () => {
    const db = require('../server/db');
    const insertOne = vi.fn();
    vi.spyOn(db, 'getDb').mockReturnValue({
      collection: () => ({ insertOne }),
    });
    const { default: app } = await import('../server.js');
    const file = path.join(__dirname, 'data', 'sample.inp');
    const res = await request(app)
      .post('/api/parse')
      .field('title', 'Sample Model')
      .attach('file', file);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('JUNCTIONS');
    expect(res.body.JUNCTIONS[0]).toMatchObject({ id: 'J1', elevation: 0 });
    expect(insertOne).toHaveBeenCalledWith({
      filename: 'sample.inp',
      title: 'Sample Model',
      uploadedAt: expect.any(Date),
      data: expect.any(Object),
    });
  });

  it('returns 400 when no file uploaded', async () => {
    const { default: app } = await import('../server.js');
    const res = await request(app).post('/api/parse');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('No file uploaded');
  });

  it('returns 422 for invalid INP file', async () => {
    const { default: app } = await import('../server.js');
    const file = path.join(__dirname, 'data', 'invalid.inp');
    const res = await request(app)
      .post('/api/parse')
      .field('title', 'Invalid Model')
      .attach('file', file);
    expect(res.status).toBe(422);
    expect(res.body.error).toMatch(/invalid or empty/i);
  });

  it('returns 400 for unsupported file type', async () => {
    const { default: app } = await import('../server.js');
    const file = path.join(__dirname, 'data', 'sample.txt');
    const res = await request(app)
      .post('/api/parse')
      .field('title', 'Text upload')
      .attach('file', file);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Unsupported file type');
  });

  it('returns 422 when parser throws an error', async () => {
    vi.resetModules();
    const parser = require('../server/inpParser.js');
    const spy = vi
      .spyOn(parser, 'parseInp')
      .mockImplementation(() => {
        throw new Error('boom');
      });
    const app = require('../server.js');
    const file = path.join(__dirname, 'data', 'sample.inp');
    const res = await request(app)
      .post('/api/parse')
      .field('title', 'Explosive upload')
      .attach('file', file);
    expect(res.status).toBe(422);
    expect(res.body.error).toBe('Parsing failed: boom');
    spy.mockRestore();
  });

  it('returns 400 when title is missing', async () => {
    const { default: app } = await import('../server.js');
    const file = path.join(__dirname, 'data', 'sample.inp');
    const res = await request(app).post('/api/parse').attach('file', file);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Title is required');
  });
});

describe('GET /api/inp-files', () => {
  it('returns stored INP file metadata', async () => {
    const records = [
      {
        _id: '1',
        filename: 'first.inp',
        title: 'First model',
        uploadedAt: '2024-01-01T00:00:00.000Z',
      },
      {
        _id: '2',
        filename: 'second.inp',
        title: 'Second model',
        uploadedAt: '2024-02-01T00:00:00.000Z',
      },
    ];
    const db = require('../server/db');
    vi.spyOn(db, 'getDb').mockReturnValue({
      collection: () => ({
        find: () => ({
          sort: () => ({
            toArray: () => Promise.resolve(records),
          }),
        }),
      }),
    });
    vi.resetModules();
    const { default: app } = await import('../server.js');
    const res = await request(app).get('/api/inp-files');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(records);
  });

  it('returns 500 when database access fails', async () => {
    const db = require('../server/db');
    vi.spyOn(db, 'getDb').mockImplementation(() => {
      throw new Error('no db');
    });
    vi.resetModules();
    const { default: app } = await import('../server.js');
    const res = await request(app).get('/api/inp-files');
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Failed to fetch INP files');
  });
});

describe('GET /api/inp-files/:id', () => {
  it('returns stored INP file data when found', async () => {
    const record = {
      _id: '507f1f77bcf86cd799439011',
      filename: 'sample.inp',
      title: 'Sample',
      uploadedAt: '2024-01-01T00:00:00.000Z',
      data: { COORDINATES: [{ id: 'n1', x: 1, y: 2 }] },
    };
    const db = require('../server/db');
    vi.spyOn(db, 'getDb').mockReturnValue({
      collection: () => ({
        findOne: () => Promise.resolve(record),
      }),
    });
    vi.resetModules();
    const { default: app } = await import('../server.js');
    const res = await request(app).get('/api/inp-files/507f1f77bcf86cd799439011');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(record);
  });

  it('returns 400 for an invalid id', async () => {
    vi.resetModules();
    const { default: app } = await import('../server.js');
    const res = await request(app).get('/api/inp-files/not-an-id');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid INP file id');
  });

  it('returns 404 when record is missing', async () => {
    const db = require('../server/db');
    vi.spyOn(db, 'getDb').mockReturnValue({
      collection: () => ({
        findOne: () => Promise.resolve(null),
      }),
    });
    vi.resetModules();
    const { default: app } = await import('../server.js');
    const res = await request(app).get('/api/inp-files/507f1f77bcf86cd799439011');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('INP file not found');
  });

  it('returns 500 when database access fails', async () => {
    const db = require('../server/db');
    vi.spyOn(db, 'getDb').mockImplementation(() => {
      throw new Error('no db');
    });
    vi.resetModules();
    const { default: app } = await import('../server.js');
    const res = await request(app).get('/api/inp-files/507f1f77bcf86cd799439011');
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Failed to load INP file');
  });
});

describe('DELETE /api/inp-files/:id', () => {
  it('returns 400 for an invalid id', async () => {
    vi.resetModules();
    const { default: app } = await import('../server.js');
    const res = await request(app).delete('/api/inp-files/not-an-id');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid INP file id');
  });

  it('returns 404 when no document is removed', async () => {
    const db = require('../server/db');
    vi.spyOn(db, 'getDb').mockReturnValue({
      collection: () => ({
        deleteOne: () => Promise.resolve({ deletedCount: 0 }),
      }),
    });
    vi.resetModules();
    const { default: app } = await import('../server.js');
    const res = await request(app).delete('/api/inp-files/507f1f77bcf86cd799439011');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('INP file not found');
  });

  it('returns 204 when deletion succeeds', async () => {
    const deleteOne = vi.fn().mockResolvedValue({ deletedCount: 1 });
    const db = require('../server/db');
    vi.spyOn(db, 'getDb').mockReturnValue({
      collection: () => ({ deleteOne }),
    });
    vi.resetModules();
    const { default: app } = await import('../server.js');
    const res = await request(app).delete('/api/inp-files/507f1f77bcf86cd799439011');
    expect(res.status).toBe(204);
    expect(deleteOne).toHaveBeenCalledTimes(1);
    expect(deleteOne).toHaveBeenCalledWith({ _id: expect.any(Object) });
  });

  it('returns 500 when deletion throws', async () => {
    const db = require('../server/db');
    vi.spyOn(db, 'getDb').mockReturnValue({
      collection: () => ({
        deleteOne: () => {
          throw new Error('boom');
        },
      }),
    });
    vi.resetModules();
    const { default: app } = await import('../server.js');
    const res = await request(app).delete('/api/inp-files/507f1f77bcf86cd799439011');
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Failed to delete INP file');
  });
});

describe('POST /api/inp-files/:id/report', () => {
  const validId = '507f1f77bcf86cd799439011';
  const createMinimalReport = () => ({
    elementCount: {
      rainGages: 0,
      subcatchments: 0,
      nodes: 0,
      links: 0,
      pollutants: 0,
      landUses: 0,
    },
    nodeSummary: [],
    linkSummary: [],
    crossSectionSummary: [],
    analysisOptions: {
      flowUnits: 'CMS',
      processModels: {},
    },
    flowRoutingContinuity: {
      dryWeatherInflow: { hectareMeters: 0, millionLiters: 0 },
      wetWeatherInflow: { hectareMeters: 0, millionLiters: 0 },
      groundwaterInflow: { hectareMeters: 0, millionLiters: 0 },
      rdiiInflow: { hectareMeters: 0, millionLiters: 0 },
      externalInflow: { hectareMeters: 0, millionLiters: 0 },
      externalOutflow: { hectareMeters: 0, millionLiters: 0 },
      floodingLoss: { hectareMeters: 0, millionLiters: 0 },
      evaporationLoss: { hectareMeters: 0, millionLiters: 0 },
      exfiltrationLoss: { hectareMeters: 0, millionLiters: 0 },
      initialStoredVolume: { hectareMeters: 0, millionLiters: 0 },
      finalStoredVolume: { hectareMeters: 0, millionLiters: 0 },
      continuityErrorPercent: 0,
    },
  });

  it('stores parsed report data and returns the saved payload', async () => {
    vi.resetModules();
    const parser = require('../server/reportParser.js');
    let uploadedPath;
    vi.spyOn(parser, 'parseReport').mockImplementation((filePath) => {
      uploadedPath = filePath;
      const report = createMinimalReport();
      report.elementCount.nodes = 10;
      report.elementCount.links = 12;
      report.analysisOptions.processModels.flowRouting = 'YES';
      return report;
    });

    const db = require('../server/db');
    let savedReport;
    const findOneAndUpdate = vi.fn().mockImplementation((_filter, update) => {
      savedReport = update.$set.report;
      return Promise.resolve({ value: { report: savedReport } });
    });
    vi.spyOn(db, 'getDb').mockReturnValue({
      collection: () => ({ findOneAndUpdate }),
    });
    let cleanedPath;
    vi.spyOn(fs, 'unlink').mockImplementation((filePath, cb) => {
      cleanedPath = filePath;
      cb && cb();
    });

    const { default: app } = await import('../server.js');
    const file = path.join(__dirname, 'data', 'sample-report.rpt');
    const res = await request(app)
      .post(`/api/inp-files/${validId}/report`)
      .attach('report', file);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      elementCount: {
        nodes: 10,
        links: 12,
      },
      analysisOptions: {
        flowUnits: 'CMS',
      },
      filename: 'sample-report.rpt',
    });
    expect(new Date(res.body.uploadedAt).toString()).not.toBe('Invalid Date');
    expect(savedReport.filename).toBe('sample-report.rpt');
    expect(savedReport.uploadedAt).toBeInstanceOf(Date);
    expect(findOneAndUpdate).toHaveBeenCalledTimes(1);
    const [filter, , options] = findOneAndUpdate.mock.calls[0];
    expect(filter._id.toHexString()).toBe(validId);
    expect(options).toEqual({ returnDocument: 'after' });
    expect(cleanedPath).toBe(uploadedPath);
  });

  it('returns 400 when id is invalid and cleans up temp file', async () => {
    vi.resetModules();
    const parser = require('../server/reportParser.js');
    const parseSpy = vi.spyOn(parser, 'parseReport');
    const unlinkSpy = vi.spyOn(fs, 'unlink').mockImplementation((_, cb) => cb && cb());
    const { default: app } = await import('../server.js');
    const file = path.join(__dirname, 'data', 'sample-report.rpt');
    const res = await request(app).post('/api/inp-files/not-an-id/report').attach('report', file);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid INP file id');
    expect(parseSpy).not.toHaveBeenCalled();
    expect(unlinkSpy).toHaveBeenCalled();
  });

  it('returns 400 when no report is uploaded', async () => {
    vi.resetModules();
    const { default: app } = await import('../server.js');
    const res = await request(app).post(`/api/inp-files/${validId}/report`);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('No report uploaded');
  });

  it('rejects unsupported file extensions', async () => {
    vi.resetModules();
    const unlinkSpy = vi.spyOn(fs, 'unlink').mockImplementation((_, cb) => cb && cb());
    const { default: app } = await import('../server.js');
    const file = path.join(__dirname, 'data', 'sample.txt');
    const res = await request(app)
      .post(`/api/inp-files/${validId}/report`)
      .attach('report', file);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Unsupported report type');
    expect(unlinkSpy).toHaveBeenCalled();
  });

  it('returns 422 when the parser reports malformed data', async () => {
    vi.resetModules();
    const parser = require('../server/reportParser.js');
    const { ReportParseError } = parser;
    vi.spyOn(parser, 'parseReport').mockImplementation(() => {
      throw new ReportParseError('Report malformed');
    });
    const unlinkSpy = vi.spyOn(fs, 'unlink').mockImplementation((_, cb) => cb && cb());
    const db = require('../server/db');
    vi.spyOn(db, 'getDb').mockReturnValue({
      collection: () => ({ findOneAndUpdate: vi.fn() }),
    });
    const { default: app } = await import('../server.js');
    const file = path.join(__dirname, 'data', 'sample-report.rpt');
    const res = await request(app)
      .post(`/api/inp-files/${validId}/report`)
      .attach('report', file);
    expect(res.status).toBe(422);
    expect(res.body.error).toBe('Report malformed');
    expect(unlinkSpy).toHaveBeenCalled();
  });

  it('returns 404 when the INP file is missing', async () => {
    vi.resetModules();
    const parser = require('../server/reportParser.js');
    vi.spyOn(parser, 'parseReport').mockReturnValue(createMinimalReport());
    const db = require('../server/db');
    const findOneAndUpdate = vi.fn().mockResolvedValue({ value: null });
    vi.spyOn(db, 'getDb').mockReturnValue({
      collection: () => ({ findOneAndUpdate }),
    });
    const unlinkSpy = vi.spyOn(fs, 'unlink').mockImplementation((_, cb) => cb && cb());
    const { default: app } = await import('../server.js');
    const file = path.join(__dirname, 'data', 'sample-report.rpt');
    const res = await request(app)
      .post(`/api/inp-files/${validId}/report`)
      .attach('report', file);
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('INP file not found');
    expect(findOneAndUpdate).toHaveBeenCalled();
    expect(unlinkSpy).toHaveBeenCalled();
  });

  it('returns 500 when persistence fails', async () => {
    vi.resetModules();
    const parser = require('../server/reportParser.js');
    vi.spyOn(parser, 'parseReport').mockReturnValue(createMinimalReport());
    const db = require('../server/db');
    vi.spyOn(db, 'getDb').mockReturnValue({
      collection: () => ({
        findOneAndUpdate: () => {
          throw new Error('db down');
        },
      }),
    });
    const unlinkSpy = vi.spyOn(fs, 'unlink').mockImplementation((_, cb) => cb && cb());
    const { default: app } = await import('../server.js');
    const file = path.join(__dirname, 'data', 'sample-report.rpt');
    const res = await request(app)
      .post(`/api/inp-files/${validId}/report`)
      .attach('report', file);
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Failed to save report');
    expect(unlinkSpy).toHaveBeenCalled();
  });
});
