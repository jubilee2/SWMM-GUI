import { render, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import ParseForm from './ParseForm'

describe('ParseForm', () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('invokes onUploadSuccess with normalized coordinates', async () => {
    const onUploadSuccess = vi.fn()
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        COORDINATES: [
          { id: 'n1', x: '1', y: 2 },
          { id: 'n2', x: 3, y: '4' }
        ],
        meta: 'info',
      }),
    })
    globalThis.fetch = fetchMock
    const { container } = render(<ParseForm onUploadSuccess={onUploadSuccess} />)
    const file = new File(['dummy'], 'test.inp', { type: 'text/plain' })
    const input = container.querySelector('input[type="file"]')
    fireEvent.change(input, { target: { files: [file] } })
    fireEvent.submit(container.querySelector('form'))
    await waitFor(() => expect(onUploadSuccess).toHaveBeenCalledTimes(1))
    const [result, normalized] = onUploadSuccess.mock.calls[0]
    expect(result).toEqual({
      COORDINATES: [
        { id: 'n1', x: '1', y: 2 },
        { id: 'n2', x: 3, y: '4' }
      ],
      meta: 'info',
    })
    expect(normalized).toEqual([
      { id: 'n1', x: 1, y: 2 },
      { id: 'n2', x: 3, y: 4 }
    ])
    expect(input.value).toBe('')
  })

  it('shows an error when coordinates are missing or invalid', async () => {
    const onUploadError = vi.fn()
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({})
    })
    const { container } = render(<ParseForm onUploadError={onUploadError} />)
    const file = new File(['dummy'], 'test.inp', { type: 'text/plain' })
    const input = container.querySelector('input[type="file"]')
    fireEvent.change(input, { target: { files: [file] } })
    fireEvent.submit(container.querySelector('form'))
    await waitFor(() =>
      expect(
        container.querySelector('.error-banner')?.textContent
      ).toContain('Invalid coordinates data received from server.')
    )
    expect(onUploadError).toHaveBeenCalledWith('Invalid coordinates data received from server.')
  })
})
