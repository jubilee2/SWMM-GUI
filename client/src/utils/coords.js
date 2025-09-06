// Coordinate conversion utilities ported from Umap.pas

// Converts world coordinate X,Y to pixel coordinates based on map window properties
export function worldToPixel(x, y, window) {
  const px = Math.round((x - window.Woffset.X) / window.WperP) + window.Poffset.X;
  const py = window.Poffset.Y - Math.round((y - window.Woffset.Y) / window.WperP);
  return { x: px, y: py };
}

// Converts pixel coordinates to world coordinates
export function pixelToWorld(px, py, window) {
  const x = (px - window.Poffset.X) * window.WperP + window.Woffset.X;
  const y = (window.Poffset.Y - py) * window.WperP + window.Woffset.Y;
  return { x, y };
}

// Convert map units to project units (degrees to meters)
export function convertMapUnits(dx, dy, dimensions) {
  if (dimensions.units === 'degrees') {
    return {
      dx: dx * dimensions.XperDeg,
      dy: dy * dimensions.YperDeg
    };
  }
  return { dx, dy };
}
