import { describe, it, expect } from 'vitest'
import { createClock, currentClock, defaultClock, withClock } from './clock'

describe('withClock', () => {
  it('uses the given clock inside the call only', () => {
    const clock = createClock()

    expect(withClock(clock, currentClock)).toBe(clock)
    expect(currentClock()).toBe(defaultClock)
  })

  it('restores the previous clock when the call throws', () => {
    // React throws from render to suspend, so this happens in normal use.
    const clock = createClock()
    const suspended = new Promise(() => {})

    let thrown: unknown
    try {
      withClock(clock, () => {
        throw suspended
      })
    } catch (error) {
      thrown = error
    }

    expect(thrown).toBe(suspended)
    expect(currentClock()).toBe(defaultClock)
  })
})
