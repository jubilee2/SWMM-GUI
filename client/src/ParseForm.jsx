import { useState } from 'react'

function ParseForm({ setCoordinates }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const file = e.target.elements.file.files[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.inp')) {
      setError('Invalid file type. Please upload a .inp file.')
      setData(null)
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/parse', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error('Upload failed')
      const json = await res.json()
      setData(json)
      if (json?.COORDINATES) {
        const coordinates = json.COORDINATES.map(([first, ...rest]) => [
          first,
          ...rest.map(Number)
        ]);
        setCoordinates(coordinates)
      }
    } catch (err) {
      setError(err.message)
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>Parse INP File</h2>
      <form onSubmit={handleSubmit}>
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
