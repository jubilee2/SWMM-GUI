import { useCallback, useEffect, useRef, useState } from 'react'

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

function ParseForm({ setCoordinates, onClose }) {
  const [title, setTitle] = useState('')
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const titleInputRef = useRef(null)
  const modalRef = useRef(null)
  const focusableElementsRef = useRef([])

  const collectFocusableElements = useCallback(() => {
    const modal = modalRef.current
    if (!modal) return

    const focusableSelector = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([type="hidden"]):not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ')

    focusableElementsRef.current = Array.from(
      modal.querySelectorAll(focusableSelector)
    ).filter((element) => !element.hasAttribute('aria-hidden'))

    if (focusableElementsRef.current.length === 0) {
      modal.focus()
    }
  }, [])

  useEffect(() => {
    titleInputRef.current?.focus()
  }, [])

  useEffect(() => {
    collectFocusableElements()
  }, [collectFocusableElements, loading, data, error])

  useEffect(() => {
    const modal = modalRef.current
    if (!modal) return

    const handleKeyDown = (event) => {
      if (event.key !== 'Tab') return

      const focusableElements = focusableElementsRef.current
      if (focusableElements.length === 0) {
        event.preventDefault()
        return
      }

      const [firstElement] = focusableElements
      const lastElement = focusableElements[focusableElements.length - 1]
      const activeElement = document.activeElement

      if (event.shiftKey) {
        if (
          activeElement === firstElement ||
          !modal.contains(activeElement)
        ) {
          lastElement.focus()
          event.preventDefault()
        }
        return
      }

      if (activeElement === lastElement || !modal.contains(activeElement)) {
        firstElement.focus()
        event.preventDefault()
      }
    }

    modal.addEventListener('keydown', handleKeyDown)

    return () => {
      modal.removeEventListener('keydown', handleKeyDown)
    }
  }, [collectFocusableElements])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formElement = e.target
    const file = formElement.elements.file.files[0]
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
    try {
      const res = await fetch('/api/parse', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error('Upload failed')
      const result = await res.json()
      setData(result)

      setTitle('')
      formElement.reset()

      const normalized = normalizeCoordinates(result.COORDINATES)
      if (!normalized) {
        setCoordinates([])
        setData(null)
        setError('Invalid coordinates data received from server.')
        return
      }

      setCoordinates(normalized)
    } catch (err) {
      setError(err.message)
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  const handleBackdropMouseDown = (event) => {
    if (event.target === event.currentTarget && onClose) {
      onClose()
    }
  }

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="parse-form-title"
      onMouseDown={handleBackdropMouseDown}
    >
      <div className="modal" role="document" tabIndex={-1} ref={modalRef}>
        <div className="modal-header">
          <h2 id="parse-form-title">Parse INP File</h2>
          {onClose && (
            <button
              type="button"
              className="modal-close"
              onClick={onClose}
              aria-label="Close upload form"
            >
              ×
            </button>
          )}
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <label htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              type="text"
              value={title}
              ref={titleInputRef}
              onChange={(event) => {
                setTitle(event.target.value)
                if (error === 'Title is required.') {
                  setError(null)
                }
              }}
              required
            />
            <input type="file" name="file" accept=".inp" />
            <button type="submit" disabled={loading}>
              {loading ? 'Uploading…' : 'Upload'}
            </button>
          </form>
          {loading && <p>Parsing...</p>}
          {error && <div className="error-banner">{error}</div>}
          {data && (
            <pre className="output">{JSON.stringify(data, null, 2)}</pre>
          )}
        </div>
      </div>
    </div>
  )
}

export default ParseForm
