import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import ReportUploadModal from './ReportUploadModal'

describe('ReportUploadModal', () => {
  const originalFetch = globalThis.fetch
  let onClose
  let onSuccess
  const fileRecord = {
    _id: 'abc123',
    filename: 'Example.inp',
    title: 'Example model',
  }

  beforeEach(() => {
    onClose = vi.fn()
    onSuccess = vi.fn()
    globalThis.fetch = vi.fn()
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    globalThis.fetch = originalFetch
  })

  it('requires a report file to be selected before uploading', async () => {
    render(<ReportUploadModal file={fileRecord} onClose={onClose} onSuccess={onSuccess} />)

    fireEvent.click(screen.getByRole('button', { name: 'Upload' }))

    expect(
      await screen.findByText('Please choose a report file to upload.')
    ).toBeInTheDocument()
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('rejects files without the .rpt extension', async () => {
    render(<ReportUploadModal file={fileRecord} onClose={onClose} onSuccess={onSuccess} />)

    const fileInput = screen.getByLabelText('Report file')
    const invalidFile = new File(['invalid'], 'example.txt', { type: 'text/plain' })

    fireEvent.change(fileInput, { target: { files: [invalidFile] } })
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }))

    expect(
      await screen.findByText('Invalid file type. Please upload a .rpt file.')
    ).toBeInTheDocument()
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('posts the selected report file to the API', async () => {
    globalThis.fetch.mockResolvedValueOnce({ ok: true })

    render(<ReportUploadModal file={fileRecord} onClose={onClose} onSuccess={onSuccess} />)

    const fileInput = screen.getByLabelText('Report file')
    const reportFile = new File(['rpt'], 'example.rpt', { type: 'text/plain' })

    fireEvent.change(fileInput, { target: { files: [reportFile] } })
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }))

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/inp-files/abc123/report',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      )
    })

    const [, options] = globalThis.fetch.mock.calls[0]
    expect(options.body.get('file')).toBe(reportFile)
    expect(onSuccess).toHaveBeenCalled()
  })
})
