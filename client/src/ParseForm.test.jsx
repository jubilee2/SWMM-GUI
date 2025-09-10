import { render, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ParseForm from './ParseForm'

describe('ParseForm', () => {
  it('shows error when coordinates are missing', async () => {
    const setCoordinates = vi.fn()
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({})
    })
    const { container, findByText } = render(
      <ParseForm setCoordinates={setCoordinates} />
    )
    const file = new File(['dummy'], 'test.inp', { type: 'text/plain' })
    const input = container.querySelector('input[type="file"]')
    fireEvent.change(input, { target: { files: [file] } })
    fireEvent.submit(container.querySelector('form'))
    await findByText('Coordinates not found in file.')
    expect(setCoordinates).toHaveBeenCalledWith([])
  })

  it('shows error when coordinates are invalid', async () => {
    const setCoordinates = vi.fn()
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ COORDINATES: [['id', 'foo', '0']] })
    })
    const { container, findByText } = render(
      <ParseForm setCoordinates={setCoordinates} />
    )
    const file = new File(['dummy'], 'test.inp', { type: 'text/plain' })
    const input = container.querySelector('input[type="file"]')
    fireEvent.change(input, { target: { files: [file] } })
    fireEvent.submit(container.querySelector('form'))
    await findByText('Invalid coordinates in file.')
    expect(setCoordinates).toHaveBeenCalledWith([])
  })
})
