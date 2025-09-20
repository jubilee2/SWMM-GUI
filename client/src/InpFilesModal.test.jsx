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
  const onClose = vi.fn()
  const originalFetch = globalThis.fetch

  beforeEach(() => {
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

    render(<InpFilesModal onClose={onClose} />)

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

  it('reloads the index after a successful upload', async () => {
    const setCoordinates = vi.fn()
    const file = new File(['dummy'], 'upload.inp', { type: 'text/plain' })

    globalThis.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          COORDINATES: [
            { id: 'n1', x: 1, y: 2 },
            { id: 'n2', x: 3, y: 4 },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            _id: 'new123',
            filename: 'upload.inp',
            title: 'Uploaded Model',
            uploadedAt: '2024-05-01T12:00:00.000Z',
          },
        ],
      })

    render(<InpFilesModal onClose={onClose} setCoordinates={setCoordinates} />)

    const titleInput = await screen.findByLabelText('Title')
    fireEvent.change(titleInput, { target: { value: 'Uploaded Model' } })

    const fileInput = titleInput.form.querySelector('input[type="file"]')
    fireEvent.change(fileInput, { target: { files: [file] } })

    fireEvent.submit(titleInput.form)

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenNthCalledWith(3, '/api/inp-files', {
        signal: undefined,
      })
    })

    await waitFor(() => {
      expect(screen.getByText('Uploaded Model')).toBeInTheDocument()
    })
  })
})
