import { useCallback, useEffect, useRef, useState } from 'react'

function ReportUploadModal({ file, onClose, onSuccess }) {
  const [error, setError] = useState(null)
  const [uploading, setUploading] = useState(false)
  const modalRef = useRef(null)
  const fileInputRef = useRef(null)
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
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ')

    focusableElementsRef.current = Array.from(modal.querySelectorAll(focusableSelector)).filter(
      (element) => !element.hasAttribute('aria-hidden')
    )

    if (focusableElementsRef.current.length === 0) {
      modal.focus()
    }
  }, [])

  useEffect(() => {
    collectFocusableElements()
  }, [collectFocusableElements, uploading, error])

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
        if (activeElement === firstElement || !modal.contains(activeElement)) {
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

  useEffect(() => {
    fileInputRef.current?.focus()
  }, [])

  const handleBackdropMouseDown = (event) => {
    if (event.target === event.currentTarget) {
      onClose?.()
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const reportFile = fileInputRef.current?.files?.[0]
    if (!reportFile) {
      setError('Please choose a report file to upload.')
      return
    }

    if (!reportFile.name.toLowerCase().endsWith('.rpt')) {
      setError('Invalid file type. Please upload a .rpt file.')
      return
    }

    const formData = new FormData()
    formData.append('file', reportFile)

    setUploading(true)
    setError(null)

    try {
      const response = await fetch(`/api/inp-files/${file._id}/report`, {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) {
        let message = 'Failed to upload report.'
        try {
          const body = await response.json()
          if (body?.error) {
            message = body.error
          }
        } catch (err) {
          console.debug('Failed to parse report upload error response', err)
        }
        throw new Error(message)
      }
      onSuccess?.()
    } catch (err) {
      setError(err.message || 'Failed to upload report.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-upload-title"
      onMouseDown={handleBackdropMouseDown}
    >
      <div className="modal" role="document" tabIndex={-1} ref={modalRef}>
        <div className="modal-header">
          <h2 id="report-upload-title">Upload Report</h2>
          <button
            type="button"
            className="modal-close"
            onClick={() => onClose?.()}
            aria-label="Close report upload"
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          <p className="modal-subtitle">
            {`Select a report for ${file?.title || file?.filename || 'this INP file'}.`}
          </p>
          <form onSubmit={handleSubmit}>
            <label htmlFor="report-file-input">Report file</label>
            <input
              ref={fileInputRef}
              id="report-file-input"
              type="file"
              name="report"
              accept=".rpt"
            />
            <div className="modal-actions">
              <button type="submit" disabled={uploading}>
                {uploading ? 'Uploading…' : 'Upload'}
              </button>
              <button type="button" onClick={() => onClose?.()} disabled={uploading}>
                Cancel
              </button>
            </div>
          </form>
          {error && <div className="error-banner">{error}</div>}
        </div>
      </div>
    </div>
  )
}

export default ReportUploadModal
