import { describe, it, expect } from 'vitest';
import { MAX_INT_COORD, convertMapUnits, getXPix, getYPix, getX, getY } from './mapUtils.js';

describe('convertMapUnits', () => {
  it('converts degrees to meters', () => {
    const dims = { units: 'degrees', xPerDeg: 111000, yPerDeg: 222000 };
    const result = convertMapUnits(1, 1, dims);
    expect(result.dx).toBeCloseTo(111000);
    expect(result.dy).toBeCloseTo(222000);
  });

  it('returns values unchanged for non-degree units', () => {
    const dims = { units: 'meters', xPerDeg: 0, yPerDeg: 0 };
    const result = convertMapUnits(5, 7, dims);
    expect(result.dx).toBe(5);
    expect(result.dy).toBe(7);
  });
});

describe('map coordinate conversions', () => {
  const window = {
    wOffset: { x: 100, y: 200 },
    wPerP: 2,
    pOffset: { x: 10, y: 20 },
  };

  it('converts world X to pixel X', () => {
    expect(getXPix(110, window)).toBe(15);
    expect(getXPix(111, window)).toBe(16);
  });

  it('converts world Y to pixel Y', () => {
    expect(getYPix(210, window)).toBe(15);
    expect(getYPix(211, window)).toBe(14);
  });

  it('getX and getY invert pixel conversion', () => {
    const x = 122;
    const xp = getXPix(x, window);
    expect(getX(xp, window)).toBe(x);

    const y = 234;
    const yp = getYPix(y, window);
    expect(getY(yp, window)).toBe(y);
  });

  it('handles coordinates near the map bounds', () => {
    const xBound = window.wOffset.x + MAX_INT_COORD * window.wPerP;
    const xPixBound = getXPix(xBound, window);
    expect(getX(xPixBound, window)).toBe(xBound);

    const yBound = window.wOffset.y + MAX_INT_COORD * window.wPerP;
    const yPixBound = getYPix(yBound, window);
    expect(getY(yPixBound, window)).toBe(yBound);
  });
});
