import { useCallback, useEffect, useState } from 'react'
import ParseForm from './ParseForm'

function formatDate(value) {
  if (!value) return 'Unknown'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown'
  return date.toLocaleString()
}

function InpFilesModal({ onClose, setCoordinates = () => {} }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const loadFiles = useCallback(async (signal) => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/inp-files', {
        signal,
      })
      if (!response.ok) {
        throw new Error('Unable to load INP file index.')
      }
      const data = await response.json()
      setFiles(Array.isArray(data) ? data : [])
    } catch (err) {
      if (err.name === 'AbortError') return
      setError(err.message)
      setFiles([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    loadFiles(controller.signal)
    return () => {
      controller.abort()
    }
  }, [loadFiles])

  const handleDelete = async (id) => {
    setError(null)
    setDeletingId(id)
    try {
      const response = await fetch(`/api/inp-files/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        let errorMessage = 'Failed to delete the selected INP file.';
        try {
          const errorBody = await response.json();
          if (errorBody.error) {
            errorMessage = errorBody.error;
          }
        } catch (e) {
          console.debug('Error parsing error response:', e); // Optional logging
        }
        throw new Error(errorMessage);
      }
      setFiles((prev) => prev.filter((file) => file._id !== id))
    } catch (err) {
      setError(err.message || 'Failed to delete the selected INP file.')
    } finally {
      setDeletingId(null)
    }
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
          <ParseForm setCoordinates={setCoordinates} onSuccess={() => loadFiles()} />
          {loading ? (
            <p>Loading INP files...</p>
          ) : error ? (
            <div className="error-banner">{error}</div>
          ) : files.length > 0 ? (
            <table className="modal-table">
              <thead>
                <tr>
                  <th scope="col">Title</th>
                  <th scope="col">File Name</th>
                  <th scope="col">Uploaded</th>
                  <th scope="col" className="actions-header">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file._id}>
                    <td>{file.title || 'Untitled'}</td>
                    <td>{file.filename || 'Unnamed file'}</td>
                    <td>{formatDate(file.uploadedAt)}</td>
                    <td className="actions-cell">
                      <button
                        type="button"
                        className="modal-action"
                        onClick={() => handleDelete(file._id)}
                        disabled={deletingId === file._id}
                        aria-label={`Delete ${file.filename || 'stored INP file'}`}
                      >
                        {deletingId === file._id ? 'Deleting…' : 'Delete'}
                      </button>
                    </td>
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
