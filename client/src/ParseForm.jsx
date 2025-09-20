import { useRef, useState } from 'react'

const normalizeCoordinates = (coordinates) => {
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

function ParseForm({ onUploadSuccess, onUploadError, onUploadStart }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const formRef = useRef(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const form = e.target
    const file = form.elements.file.files[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.inp')) {
      setError('Invalid file type. Please upload a .inp file.')
      setData(null)
      onUploadError?.('Invalid file type. Please upload a .inp file.')
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    setLoading(true)
    setError(null)
    setData(null)
    onUploadStart?.()
    try {
      const res = await fetch('/api/parse', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error('Upload failed')
      const result = await res.json()

      const normalized = normalizeCoordinates(result.COORDINATES)
      if (!normalized) {
        const message = 'Invalid coordinates data received from server.'
        setError(message)
        setData(null)
        onUploadError?.(message)
        return
      }

      setData(result)
      formRef.current?.reset()
      onUploadSuccess?.(result, normalized)
    } catch (err) {
      setError(err.message)
      setData(null)
      onUploadError?.(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>Parse INP File</h2>
      <form ref={formRef} onSubmit={handleSubmit}>
        <input type="file" name="file" accept=".inp" />
        <button type="submit">Upload</button>
      </form>
      {loading && <p>Parsing...</p>}
      {error && <div className="error-banner">{error}</div>}
      {data && (
        <pre className="output">{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  )
}

export default ParseForm
