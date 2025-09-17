import { render, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ParseForm from './ParseForm'

describe('ParseForm', () => {
  it('passes coordinates from parser to setCoordinates', async () => {
    const setCoordinates = vi.fn()
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ COORDINATES: [{ id: 'n1', x: 1, y: 2 }] })
    })
    const { container } = render(<ParseForm setCoordinates={setCoordinates} />)
    const file = new File(['dummy'], 'test.inp', { type: 'text/plain' })
    const input = container.querySelector('input[type="file"]')
    fireEvent.change(input, { target: { files: [file] } })
    fireEvent.submit(container.querySelector('form'))
    await waitFor(() =>
      expect(setCoordinates).toHaveBeenCalledWith([{ id: 'n1', x: 1, y: 2 }])
    )
  })

  it('handles missing coordinates field', async () => {
    const setCoordinates = vi.fn()
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({})
    })
    const { container } = render(<ParseForm setCoordinates={setCoordinates} />)
    const file = new File(['dummy'], 'test.inp', { type: 'text/plain' })
    const input = container.querySelector('input[type="file"]')
    fireEvent.change(input, { target: { files: [file] } })
    fireEvent.submit(container.querySelector('form'))
    await waitFor(() => expect(setCoordinates).toHaveBeenCalledWith([]))
  })
})
