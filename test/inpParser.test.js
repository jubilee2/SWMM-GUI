import path from 'path';
import { describe, it, expect } from 'vitest';
import parser from '../server/inpParser.js';

const { parseInp } = parser;

describe('parseInp', () => {
  it('extracts sections and values', () => {
    const file = path.join(__dirname, 'data', 'sample.inp');
    const result = parseInp(file);
    expect(result).toHaveProperty('JUNCTIONS');
    expect(result).toHaveProperty('CONDUITS');
    expect(result).toHaveProperty('COORDINATES');
    expect(result.JUNCTIONS[0][0]).toBe('J1');
    expect(result.CONDUITS[0][1]).toBe('J1');
    expect(result.COORDINATES).toHaveLength(2);
    expect(result.COORDINATES[0]).toEqual({ id: 'J1', x: 100, y: 100 });
  });

  it('omits coordinates section when none exists', () => {
    const file = path.join(__dirname, 'data', 'nocoords.inp');
    const result = parseInp(file);
    expect(result.COORDINATES).toBeUndefined();
  });
});
