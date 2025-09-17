import { useEffect, useState } from 'react'

function formatDate(value) {
  if (!value) return 'Unknown'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown'
  return date.toLocaleString()
}

function InpFilesModal({ onClose }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    const loadFiles = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/inp-files', {
          signal: controller.signal,
        })
        if (!response.ok) {
          throw new Error('Unable to load INP file index.')
        }
        const data = await response.json()
        if (isMounted) {
          setFiles(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        if (err.name === 'AbortError') return
        if (isMounted) {
          setError(err.message)
          setFiles([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadFiles()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [])

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="inp-files-title">
      <div className="modal">
        <div className="modal-header">
          <h2 id="inp-files-title">Stored INP Files</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close stored INP files list">
            ×
          </button>
        </div>
        <div className="modal-body">
          {loading && <p>Loading INP files...</p>}
          {error && <div className="error-banner">{error}</div>}
          {!loading && !error && files.length === 0 && <p>No INP files have been stored yet.</p>}
          {!loading && !error && files.length > 0 && (
            <table className="modal-table">
              <thead>
                <tr>
                  <th scope="col">File Name</th>
                  <th scope="col">Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file._id || `${file.filename}-${file.uploadedAt}`}>
                    <td>{file.filename || 'Unnamed file'}</td>
                    <td>{formatDate(file.uploadedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default InpFilesModal
