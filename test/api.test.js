import path from 'path';
import request from 'supertest';
import { describe, it, expect, vi } from 'vitest';

describe('POST /api/parse', () => {
  it('parses uploaded INP file', async () => {
    const { default: app } = await import('../server.js');
    const file = path.join(__dirname, 'data', 'sample.inp');
    const res = await request(app).post('/api/parse').attach('file', file);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('JUNCTIONS');
    expect(res.body.JUNCTIONS[0][0]).toBe('J1');
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
    const res = await request(app).post('/api/parse').attach('file', file);
    expect(res.status).toBe(422);
    expect(res.body.error).toMatch(/invalid or empty/i);
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
    const res = await request(app).post('/api/parse').attach('file', file);
    expect(res.status).toBe(422);
    expect(res.body.error).toBe('Parsing failed: boom');
    spy.mockRestore();
  });
});
