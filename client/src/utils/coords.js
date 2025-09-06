// Coordinate conversion utilities ported from Umap.pas
// Window: { WperP: number, Woffset: { x: number, y: number }, Poffset: { x: number, y: number } }

export function worldToPixelX(x, window) {
  const p = (x - window.Woffset.x) / window.WperP
  return Math.round(p) + window.Poffset.x
}

export function worldToPixelY(y, window) {
  const p = (y - window.Woffset.y) / window.WperP
  return window.Poffset.y - Math.round(p)
}

export function pixelToWorldX(x, window) {
  return (x - window.Poffset.x) * window.WperP + window.Woffset.x
}

export function pixelToWorldY(y, window) {
  return (window.Poffset.y - y) * window.WperP + window.Woffset.y
}
