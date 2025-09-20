import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import InpFilesModal from './InpFilesModal'

function createDeferred() {
  let resolve
  const promise = new Promise((res) => {
    resolve = res
  })
  return { promise, resolve }
}

describe('InpFilesModal', () => {
  let onClose
  let onUploadClick
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    onClose = vi.fn()
    onUploadClick = vi.fn()
    globalThis.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    globalThis.fetch = originalFetch
  })

  it('deletes a file when the delete button is clicked', async () => {
    const deleteDeferred = createDeferred()

    globalThis.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            _id: 'abc123',
            filename: 'Example.inp',
            title: 'Example model',
            uploadedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
      })
      .mockReturnValueOnce(deleteDeferred.promise)

    render(<InpFilesModal onClose={onClose} onUploadClick={onUploadClick} />)

    expect(await screen.findByText('Example model')).toBeInTheDocument()
    const deleteButton = await screen.findByRole('button', { name: 'Delete Example.inp' })

    fireEvent.click(deleteButton)

    expect(deleteButton).toBeDisabled()
    expect(globalThis.fetch).toHaveBeenNthCalledWith(2, '/api/inp-files/abc123', {
      method: 'DELETE',
    })

    deleteDeferred.resolve({
      ok: true,
      status: 204,
    })

    await waitFor(() => {
      expect(screen.queryByText('Example.inp')).not.toBeInTheDocument()
    })
  })

  it('renders the upload button and triggers callback when clicked', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    })

    render(<InpFilesModal onClose={onClose} onUploadClick={onUploadClick} />)

    const uploadButtons = await screen.findAllByRole('button', { name: 'Upload INP File' })
    uploadButtons.forEach((button) => fireEvent.click(button))

    expect(onUploadClick).toHaveBeenCalled()
  })
})
