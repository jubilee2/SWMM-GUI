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
    expect(result.JUNCTIONS[0].id).toBe('J1');
    expect(result.CONDUITS[0].from).toBe('J1');
    expect(result.COORDINATES[0]).toMatchObject({ id: 'J1', x: 100, y: 100 });
  });
});
