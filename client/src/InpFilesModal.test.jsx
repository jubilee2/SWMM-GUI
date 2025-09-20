import { render, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import InpFilesModal from './InpFilesModal'

describe('InpFilesModal', () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('shows the upload form when toggled', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    })
    globalThis.fetch = fetchMock
    const { container, getByRole } = render(
      <InpFilesModal onClose={() => {}} />
    )

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))

    expect(container.querySelector('input[type="file"]')).toBeNull()

    const toggleButton = getByRole('button', { name: /upload new inp file/i })
    fireEvent.click(toggleButton)

    expect(container.querySelector('input[type="file"]')).not.toBeNull()
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true')
  })
})
