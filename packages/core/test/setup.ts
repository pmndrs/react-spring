import createMockRaf from 'mock-raf'
import { flushMicroTasks } from 'flush-microtasks'
import { isEqual, is, FrameLoop } from 'shared'

import { Globals, SpringValue, Controller, FrameValue } from '..'
import { computeGoal } from '../src/helpers'

// Allow indefinite tests, since we limit the number of animation frames
// per "advanceUntil" call to 1000. This keeps the "isRunning" variable
// from interfering with the debugger.
jest.setTimeout(6e8)

let isRunning = false
let frameCache: WeakMap<any, any[]>

beforeEach(() => {
  isRunning = true
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

afterEach(() => {
  isRunning = false

  // Clear the frameloop.
  Globals.frameLoop['_animations'].length = 0
})

// This observes every SpringValue animation when "advanceUntil" is used.
// Any changes between frames are not recorded.
const frameObserver = {
  onParentChange(event: FrameValue.Event) {
    const spring = event.parent
    if (event.type == 'change') {
      let frames = frameCache.get(spring)
      if (!frames) frameCache.set(spring, (frames = []))
      frames.push(event.value)
    }
  },
}

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

global.countBounces = spring => {
  const { to, from } = spring.animation
  let prev = from
  let count = 0
  getFrames(spring, true).forEach(value => {
    if (value !== to && value > to !== prev > to) {
      count += 1
    }
    prev = value
  })
  return count
}

global.advanceUntil = async test => {
  let steps = 0
  while (isRunning && !test()) {
    // Clone the animation array before stepping, because idle animations
    // will be removed before "mockRaf.step" returns.
    const anims: SpringValue[] = []
    for (const anim of Globals.frameLoop['_animations']) {
      if (!anim.idle && anim instanceof SpringValue) {
        anim.addChild(frameObserver)
        anims.push(anim)
      }
    }

    mockRaf.step()
    for (const anim of anims) {
      anim.removeChild(frameObserver)
    }

    await flushMicroTasks()
    if (++steps > 1e3) {
      throw Error('Infinite loop detected')
    }
  }
}

global.advance = (n = 1) => {
  return advanceUntil(() => --n < 0)
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
