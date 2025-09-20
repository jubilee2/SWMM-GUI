import { useCallback, useEffect, useRef, useState } from 'react'
import ParseForm from './ParseForm'

function formatDate(value) {
  if (!value) return 'Unknown'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown'
  return date.toLocaleString()
}

function InpFilesModal({ onClose, onUploadSuccess, onUploadError }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showUploader, setShowUploader] = useState(false)
  const isMountedRef = useRef(true)

  const loadFiles = useCallback(
    async (signal) => {
      try {
        if (isMountedRef.current) {
          setLoading(true)
          setError(null)
        }
        const response = await fetch(
          '/api/inp-files',
          signal ? { signal } : undefined
        )
        if (!response.ok) {
          throw new Error('Unable to load INP file index.')
        }
        const data = await response.json()
        if (isMountedRef.current) {
          setFiles(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        if (err.name === 'AbortError') return
        if (isMountedRef.current) {
          setError(err.message)
          setFiles([])
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false)
        }
      }
    },
    []
  )

  useEffect(() => {
    isMountedRef.current = true
    const controller = new AbortController()
    loadFiles(controller.signal)
    return () => {
      isMountedRef.current = false
      controller.abort()
    }
  }, [loadFiles])

  const handleUploadSuccess = (result, coordinates) => {
    setShowUploader(false)
    loadFiles()
    onUploadSuccess?.(result, coordinates)
  }

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
          <button
            type="button"
            className="modal-toggle"
            onClick={() => setShowUploader((prev) => !prev)}
            aria-expanded={showUploader}
          >
            {showUploader ? 'Hide upload form' : 'Upload new INP file'}
          </button>
          {showUploader && (
            <ParseForm
              onUploadSuccess={handleUploadSuccess}
              onUploadError={onUploadError}
            />
          )}
          {loading ? (
            <p>Loading INP files...</p>
          ) : error ? (
            <div className="error-banner">{error}</div>
          ) : files.length > 0 ? (
            <table className="modal-table">
              <thead>
                <tr>
                  <th scope="col">File Name</th>
                  <th scope="col">Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file._id}>
                    <td>{file.filename || 'Unnamed file'}</td>
                    <td>{formatDate(file.uploadedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No INP files have been stored yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default InpFilesModal
