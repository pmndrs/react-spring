import { describe, it, expect, vi, afterEach } from 'vitest'
import { onScroll } from './index'

describe('onScroll listener cleanup', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('removeEventListener is called with the same options used by addEventListener (#2384)', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const addSpy = vi.spyOn(container, 'addEventListener')
    const removeSpy = vi.spyOn(container, 'removeEventListener')
    const windowAddSpy = vi.spyOn(window, 'addEventListener')
    const windowRemoveSpy = vi.spyOn(window, 'removeEventListener')

    try {
      const cleanup = onScroll(vi.fn(), { container })

      // scroll goes on the container; resize goes on window
      expect(addSpy).toHaveBeenCalledTimes(1)
      expect(addSpy).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function),
        expect.objectContaining({ passive: true })
      )
      expect(windowAddSpy).toHaveBeenCalledWith(
        'resize',
        expect.any(Function),
        expect.objectContaining({ passive: true })
      )

      // cleanup must not throw — remove calls pass the same options
      expect(() => cleanup()).not.toThrow()
      expect(removeSpy).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function),
        expect.objectContaining({ passive: true })
      )
      expect(windowRemoveSpy).toHaveBeenCalledWith(
        'resize',
        expect.any(Function),
        expect.objectContaining({ passive: true })
      )
    } finally {
      container.remove()
    }
  })
})
