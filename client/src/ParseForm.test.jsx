import { render, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import ParseForm from './ParseForm'

describe('ParseForm', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('passes coordinates from parser to setCoordinates', async () => {
    const setCoordinates = vi.fn()
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ COORDINATES: [{ id: 'n1', x: 1, y: 2 }] })
    })
    const { container } = render(
      <ParseForm setCoordinates={setCoordinates} onClose={() => {}} />
    )
    const file = new File(['dummy'], 'test.inp', { type: 'text/plain' })
    const titleInput = container.querySelector('input[name="title"]')
    fireEvent.change(titleInput, { target: { value: 'Test upload' } })
    const input = container.querySelector('input[type="file"]')
    fireEvent.change(input, { target: { files: [file] } })
    fireEvent.submit(container.querySelector('form'))
    await waitFor(() =>
      expect(setCoordinates).toHaveBeenCalledWith([{ id: 'n1', x: 1, y: 2 }])
    )
    const formData = globalThis.fetch.mock.calls[0][1].body
    expect(formData.get('title')).toBe('Test upload')
  })

  it('shows an error when coordinates are missing or invalid', async () => {
    const setCoordinates = vi.fn()
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({})
    })
    const { container } = render(
      <ParseForm setCoordinates={setCoordinates} onClose={() => {}} />
    )
    const file = new File(['dummy'], 'test.inp', { type: 'text/plain' })
    const titleInput = container.querySelector('input[name="title"]')
    fireEvent.change(titleInput, { target: { value: 'Another upload' } })
    const input = container.querySelector('input[type="file"]')
    fireEvent.change(input, { target: { files: [file] } })
    fireEvent.submit(container.querySelector('form'))
    await waitFor(() => expect(setCoordinates).toHaveBeenCalledWith([]))
    await waitFor(() =>
      expect(
        container.querySelector('.error-banner')?.textContent
      ).toContain('Invalid coordinates data received from server.')
    )
  })

  it('prevents submission without a title', async () => {
    const setCoordinates = vi.fn()
    globalThis.fetch = vi.fn()
    const { container } = render(
      <ParseForm setCoordinates={setCoordinates} onClose={() => {}} />
    )
    const file = new File(['dummy'], 'test.inp', { type: 'text/plain' })
    const input = container.querySelector('input[type="file"]')
    fireEvent.change(input, { target: { files: [file] } })
    fireEvent.submit(container.querySelector('form'))
    expect(globalThis.fetch).not.toHaveBeenCalled()
    expect(container.querySelector('.error-banner')?.textContent).toContain(
      'Title is required.'
    )
  })

  it('allows closing the modal via the close button', () => {
    const onClose = vi.fn()
    const { getByLabelText } = render(
      <ParseForm setCoordinates={() => {}} onClose={onClose} />
    )
    fireEvent.click(getByLabelText('Close upload form'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes the modal when clicking on the backdrop', () => {
    const onClose = vi.fn()
    const { container } = render(
      <ParseForm setCoordinates={() => {}} onClose={onClose} />
    )
    const backdrop = container.querySelector('.modal-backdrop')
    fireEvent.mouseDown(backdrop)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not close the modal when interacting inside it', () => {
    const onClose = vi.fn()
    const { container } = render(
      <ParseForm setCoordinates={() => {}} onClose={onClose} />
    )
    const modal = container.querySelector('.modal')
    fireEvent.mouseDown(modal)
    expect(onClose).not.toHaveBeenCalled()
  })
})
