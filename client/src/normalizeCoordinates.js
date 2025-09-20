export default function normalizeCoordinates(coordinates) {
  if (!Array.isArray(coordinates)) return null

  const normalized = []
  for (const coord of coordinates) {
    if (!coord || typeof coord !== 'object' || Array.isArray(coord)) return null
    const { id, x, y } = coord
    if (id === undefined || x === undefined || y === undefined) return null

    const xNum = Number(x)
    const yNum = Number(y)
    if (!Number.isFinite(xNum) || !Number.isFinite(yNum)) return null

    normalized.push({ id: String(id), x: xNum, y: yNum })
  }

  return normalized
}
