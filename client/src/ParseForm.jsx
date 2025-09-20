import { useEffect, useState } from 'react'

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

function ParseForm({ setCoordinates = () => {}, onSuccess }) {
  const [title, setTitle] = useState('')
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [pendingSubmission, setPendingSubmission] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    const file = e.target.elements.file.files[0]
    if (!file) return

    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setError('Title is required.')
      setData(null)
      return
    }

    if (!file.name.toLowerCase().endsWith('.inp')) {
      setError('Invalid file type. Please upload a .inp file.')
      setData(null)
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', trimmedTitle)
    setLoading(true)
    setError(null)
    setPendingSubmission({ formData })
  }

  useEffect(() => {
    if (!pendingSubmission) return undefined

    const controller = new AbortController()
    let isActive = true

    const submit = async () => {
      try {
        const res = await fetch('/api/parse', {
          method: 'POST',
          body: pendingSubmission.formData,
          signal: controller.signal,
        })
        if (!res.ok) throw new Error('Upload failed')
        const result = await res.json()
        if (!isActive) return

        setData(result)
        setTitle('')

        const normalized = normalizeCoordinates(result.COORDINATES)
        if (!normalized) {
          setCoordinates([])
          setData(null)
          setError('Invalid coordinates data received from server.')
          return
        }

        setCoordinates(normalized)
        if (onSuccess) {
          onSuccess(result)
        }
      } catch (err) {
        if (!isActive || err.name === 'AbortError') return
        setError(err.message)
        setData(null)
      } finally {
        if (isActive) {
          setLoading(false)
          setPendingSubmission(null)
        }
      }
    }

    submit()

    return () => {
      isActive = false
      controller.abort()
    }
  }, [pendingSubmission, onSuccess, setCoordinates])

  return (
    <div>
      <h2>Parse INP File</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value)
            if (error === 'Title is required.') {
              setError(null)
            }
          }}
          required
        />
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
