import { describe, it, expect, vi, afterEach } from 'vitest'
import { onScroll } from './index'

describe('onScroll listener cleanup', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('removeEventListener is called with the same options used by addEventListener (#2384)', () => {
    const listenerMap = new Map<string, { fn: EventListener; options?: boolean | AddEventListenerOptions }[]>()

    const target = {
      addEventListener: vi.fn((type: string, fn: EventListener, options?: boolean | AddEventListenerOptions) => {
        const list = listenerMap.get(type) || []
        list.push({ fn, options })
        listenerMap.set(type, list)
      }),
      removeEventListener: vi.fn((type: string, fn: EventListener, options?: boolean | AddEventListenerOptions) => {
        const list = listenerMap.get(type) || []
        const idx = list.findIndex(
          e => e.fn === fn && JSON.stringify(e.options) === JSON.stringify(options)
        )
        if (idx >= 0) list.splice(idx, 1)
        else {
          // Listener not found — mismatch between add/remove options
          throw new Error(
            `UNMATCHED removeEventListener: ${type} options=${JSON.stringify(options)}`
          )
        }
      }),
    } as unknown as HTMLElement

    const cleanup = onScroll(vi.fn(), { container: target })

    // Expect both add calls to have fired with { passive: true }
    expect(target.addEventListener).toHaveBeenCalledTimes(2)
    for (const [type] of (target.addEventListener as any).mock.calls) {
      expect(['scroll', 'resize']).toContain(type)
    }

    // Now cleanup — remove calls must also pass { passive: true }
    expect(() => cleanup()).not.toThrow()
  })
})
