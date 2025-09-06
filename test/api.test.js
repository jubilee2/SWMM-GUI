import path from 'path';
import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../server.js';

describe('POST /api/parse', () => {
  it('parses uploaded INP file', async () => {
    const file = path.join(__dirname, 'data', 'sample.inp');
    const res = await request(app).post('/api/parse').attach('file', file);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('JUNCTIONS');
    expect(res.body.JUNCTIONS[0][0]).toBe('J1');
  });

  it('returns 400 when no file uploaded', async () => {
    const res = await request(app).post('/api/parse');
    expect(res.status).toBe(400);
  });
});
