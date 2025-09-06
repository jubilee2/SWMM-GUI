export const MAX_INT_COORD = 32767;

// Converts map units to meters if units are degrees
export function convertMapUnits(dx, dy, dimensions) {
  const { units, xPerDeg, yPerDeg } = dimensions;
  if (units === 'degrees') {
    return {
      dx: dx * xPerDeg,
      dy: dy * yPerDeg,
    };
  }
  return { dx, dy };
}

// Converts world coordinate X to a screen pixel value
export function getXPix(x, window) {
  const p = (x - window.wOffset.x) / window.wPerP;
  return Math.round(p) + window.pOffset.x;
}

// Converts world coordinate Y to a screen pixel value
export function getYPix(y, window) {
  const p = (y - window.wOffset.y) / window.wPerP;
  return window.pOffset.y - Math.round(p);
}

// Converts a screen pixel location to an X world coordinate value
export function getX(xPix, window) {
  return (xPix - window.pOffset.x) * window.wPerP + window.wOffset.x;
}

// Converts a screen pixel location to a Y world coordinate value
export function getY(yPix, window) {
  return (window.pOffset.y - yPix) * window.wPerP + window.wOffset.y;
}
