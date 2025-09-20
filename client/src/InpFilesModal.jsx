import { useEffect, useState } from 'react'

function formatDate(value) {
  if (!value) return 'Unknown'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown'
  return date.toLocaleString()
}

function InpFilesModal({ onClose, onUploadClick, onLoad }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [loadingId, setLoadingId] = useState(null)

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

  const handleLoad = async (id) => {
    if (!onLoad) return
    setError(null)
    setLoadingId(id)
    try {
      await onLoad(id)
    } catch (err) {
      setError(err.message || 'Failed to load the selected INP file.')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="inp-files-title">
      <div className="modal">
        <div className="modal-header">
          <h2 id="inp-files-title">Stored INP Files</h2>
          <div className="modal-header-actions">
            {onUploadClick && (
              <button type="button" className="modal-action" onClick={onUploadClick}>
                Upload INP File
              </button>
            )}
            <button type="button" className="modal-close" onClick={onClose} aria-label="Close stored INP files list">
              ×
            </button>
          </div>
        </div>
        <div className="modal-body">
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
                      {onLoad && (
                        <button
                          type="button"
                          className="modal-action"
                          onClick={() => handleLoad(file._id)}
                          disabled={loadingId === file._id || deletingId === file._id}
                          aria-label={`Load ${file.filename || 'stored INP file'}`}
                        >
                          {loadingId === file._id ? 'Loading…' : 'Load'}
                        </button>
                      )}
                      <button
                        type="button"
                        className="modal-action"
                        onClick={() => handleDelete(file._id)}
                        disabled={deletingId === file._id || loadingId === file._id}
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
