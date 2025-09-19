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
})
