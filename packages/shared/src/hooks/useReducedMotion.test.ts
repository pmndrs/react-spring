import { act, renderHook } from '@testing-library/react'

import { useReducedMotion } from './useReducedMotion'

describe('useReducedMotion', () => {
  let EVENTS: Record<string, MediaQueryHandler> = {}

  const removeEventListenerMock = jest.fn()

  type MediaQueryHandler = (mediaQuery: typeof mqDefaults) => void

  const mqDefaults = {
    matches: false,
    onchange: null,
    addEventListener: (name: string, handle: MediaQueryHandler) => {
      EVENTS[name] = handle
    },
    removeEventListener: removeEventListenerMock,
  }

  afterEach(() => {
    // reset events
    EVENTS = {}

    jest.clearAllMocks()
  })

  it('returns true if "Reduce motion" is enabled', async () => {
    window.matchMedia = jest.fn().mockImplementation(query => {
      return {
        ...mqDefaults,
        matches: true,
        media: query,
      }
    })

    const { result } = renderHook(useReducedMotion)

    expect(result.current).toBe(true)
  })

  it('returns false if "Reduce motion" is disabled', async () => {
    window.matchMedia = jest.fn().mockImplementation(query => {
      return {
        ...mqDefaults,
        media: query,
      }
    })

    const { result } = renderHook(useReducedMotion)

    expect(result.current).toBe(false)
  })

  it('handles change of "prefers-reduce-motion" media query value', async () => {
    window.matchMedia = jest.fn().mockImplementation(query => {
      return {
        ...mqDefaults,
        media: query,
      }
    })

    const { result } = renderHook(useReducedMotion)

    expect(result.current).toBe(false)

    act(() => {
      EVENTS.change({
        ...mqDefaults,
        matches: true,
      })
    })

    expect(result.current).toBe(true)
  })

  it('successfully removes listener on unmount', () => {
    window.matchMedia = jest.fn().mockImplementation(query => {
      return {
        ...mqDefaults,
        media: query,
      }
    })

    const { unmount } = renderHook(useReducedMotion)

    unmount()

    expect(removeEventListenerMock).toHaveBeenCalled()
  })
})
