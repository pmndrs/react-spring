import createMockRaf from 'mock-raf'
import { isEqual, is, FrameLoop } from 'shared'

import { Globals, SpringValue, Controller } from '..'
import { computeGoal } from '../src/helpers'

let frameCache: WeakMap<any, any[]>

beforeEach(() => {
  frameCache = new WeakMap()

  global.mockRaf = createMockRaf()
  Globals.assign({
    now: mockRaf.now,
    performanceNow: mockRaf.now,
    requestAnimationFrame: mockRaf.raf,
    cancelAnimationFrame: mockRaf.cancel,
    frameLoop: new FrameLoop(),
  })
})

global.getFrames = (target: SpringValue | Controller, preserve?: boolean) => {
  let frames = frameCache.get(target)!
  if (!preserve) {
    frameCache.delete(target)
  }
  if (!frames && target instanceof Controller) {
    frames = []
    target.each(spring => {
      getFrames(spring, preserve).forEach((value, i) => {
        const frame = frames[i] || (frames[i] = {})
        frame[spring.key!] = value
      })
    })
    if (preserve) {
      frameCache.set(target, frames)
    }
  }
  return frames || []
}

global.advanceUntil = async test => {
  let steps = 0
  while (!test()) {
    // Clone the animation array before stepping, because idle animations
    // will be removed before "mockRaf.step" returns.
    const animations = Array.from(
      Globals.frameLoop['_animations']
    ) as SpringValue[]

    mockRaf.step()
    animations.forEach(animation => {
      let frames = frameCache.get(animation)
      if (!frames) {
        frameCache.set(animation, (frames = []))
      }
      frames.push(animation.get())
    })

    await Promise.resolve()
    if (++steps > 5e4) {
      throw Error('Infinite loop detected')
    }
  }
}

global.advanceUntilIdle = () => {
  return advanceUntil(() => Globals.frameLoop['_idle'])
}

// TODO: support "value" as an array or animatable string
global.advanceUntilValue = (spring, value) => {
  const goal = computeGoal(value)

  let lastValue: any
  return advanceUntil(() => {
    const value = spring.get()
    expect(value).not.toBe(lastValue)

    if (lastValue == null) {
      lastValue = value
      return false
    }

    const stop = is.num(goal)
      ? goal > lastValue
        ? goal <= value
        : goal >= value
      : isEqual(value, goal)

    lastValue = value
    return stop
  })
}
