import { render, fireEvent, cleanup, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import ParseForm from './ParseForm'

describe('ParseForm', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('prevents submission without a title', () => {
    globalThis.fetch = vi.fn()
    const { container } = render(<ParseForm onClose={() => {}} />)
    const file = new File(['dummy'], 'test.inp', { type: 'text/plain' })
    const input = container.querySelector('input[type="file"]')
    fireEvent.change(input, { target: { files: [file] } })
    fireEvent.submit(container.querySelector('form'))
    expect(globalThis.fetch).not.toHaveBeenCalled()
    expect(container.querySelector('.error-banner')?.textContent).toContain(
      'Title is required.'
    )
  })

  it('uploads the file and shows the parsed output on success', async () => {
    const mockResponse = { foo: 'bar' }
    const json = vi.fn().mockResolvedValue(mockResponse)
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, json })

    const { container, findByText } = render(<ParseForm onClose={() => {}} />)

    const file = new File(['dummy'], 'test.inp', { type: 'text/plain' })
    const input = container.querySelector('input[type="file"]')
    fireEvent.change(input, { target: { files: [file] } })

    fireEvent.change(container.querySelector('#title'), {
      target: { value: 'Example title' },
    })

    fireEvent.submit(container.querySelector('form'))

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalledTimes(1))
    expect(globalThis.fetch).toHaveBeenCalledWith('/api/parse', {
      method: 'POST',
      body: expect.any(FormData),
    })

    await findByText(/"foo": "bar"/)
  })

  it('shows an error if the upload fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false })

    const { container, findByText } = render(<ParseForm onClose={() => {}} />)

    const file = new File(['dummy'], 'test.inp', { type: 'text/plain' })
    const input = container.querySelector('input[type="file"]')
    fireEvent.change(input, { target: { files: [file] } })

    fireEvent.change(container.querySelector('#title'), {
      target: { value: 'Example title' },
    })

    fireEvent.submit(container.querySelector('form'))

    await findByText('Upload failed')
  })

  it('allows closing the modal via the close button', () => {
    const onClose = vi.fn()
    const { getByLabelText } = render(<ParseForm onClose={onClose} />)
    fireEvent.click(getByLabelText('Close upload form'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes the modal when clicking on the backdrop', () => {
    const onClose = vi.fn()
    const { container } = render(<ParseForm onClose={onClose} />)
    const backdrop = container.querySelector('.modal-backdrop')
    fireEvent.mouseDown(backdrop)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not close the modal when interacting inside it', () => {
    const onClose = vi.fn()
    const { container } = render(<ParseForm onClose={onClose} />)
    const modal = container.querySelector('.modal')
    fireEvent.mouseDown(modal)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('cycles focus to the first element when tabbing forward from the last', () => {
    const { getByLabelText, getByText } = render(<ParseForm onClose={() => {}} />)

    const submitButton = getByText('Upload')
    submitButton.focus()
    expect(document.activeElement).toBe(submitButton)

    fireEvent.keyDown(submitButton, { key: 'Tab', code: 'Tab' })

    const closeButton = getByLabelText('Close upload form')
    expect(document.activeElement).toBe(closeButton)
  })

  it('cycles focus to the last element when shift+tabbing from the first', () => {
    const { getByLabelText, getByText } = render(<ParseForm onClose={() => {}} />)

    const closeButton = getByLabelText('Close upload form')
    closeButton.focus()
    expect(document.activeElement).toBe(closeButton)

    fireEvent.keyDown(closeButton, { key: 'Tab', code: 'Tab', shiftKey: true })

    const submitButton = getByText('Upload')
    expect(document.activeElement).toBe(submitButton)
  })
})
