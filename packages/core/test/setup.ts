import createMockRaf from 'mock-raf'
import { flushMicroTasks } from 'flush-microtasks'
import { act } from '@testing-library/react'
import { isEqual, is, FrameLoop } from 'shared'
import colorNames from 'shared/colors'

import { Globals, Controller, FrameValue } from '..'
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
    requestAnimationFrame: mockRaf.raf,
    frameLoop: new FrameLoop(),
    colorNames,
    // This lets our useTransition hook force its component
    // to update from within an "onRest" handler.
    batchedUpdates: act,
  })
})

afterEach(() => {
  isRunning = false
  Globals.frameLoop['_dispose']()
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

global.getFrames = (target, preserve) => {
  let frames = frameCache.get(target)!
  if (!preserve) {
    frameCache.delete(target)
  }
  if (!frames) {
    frames = []
    if (target instanceof Controller) {
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
  }
  return frames
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
    // Observe animations scheduled for next frame.
    const values: FrameValue[] = []
    const observe = (value: unknown) => {
      if (value instanceof FrameValue && !value.idle) {
        value['_children'].forEach(observe)
        value.addChild(frameObserver)
        values.push(value)
      }
    }

    Globals.assign({
      willAdvance: animations => animations.forEach(observe),
    })

    jest.advanceTimersByTime(1000 / 60)
    mockRaf.step()

    // Stop observing after the frame is processed.
    for (const value of values) {
      value.removeChild(frameObserver)
    }

    // Ensure pending effects are flushed.
    await flushMicroTasks()

    // Prevent infinite recursion.
    if (++steps > 1e3) {
      throw Error('Infinite loop detected')
    }
  }
}

global.advance = (n = 1) => {
  return advanceUntil(() => --n < 0)
}

global.advanceByTime = ms => {
  let fired = false
  setTimeout(() => (fired = true), ms)
  return advanceUntil(() => fired)
}

global.advanceUntilIdle = () => {
  return advanceUntil(() => Globals.frameLoop['_idle'])
}

// TODO: support "value" as an array or animatable string
global.advanceUntilValue = (spring, value) => {
  const from = computeGoal(spring.get())
  const goal = computeGoal(value)

  const offset = getFrames(spring, true).length
  return advanceUntil(() => {
    const frames = getFrames(spring, true)
    const value = frames.length - offset > 0 ? frames[frames.length - 1] : from

    const stop = is.num(goal)
      ? goal > from
        ? goal <= value
        : goal >= value
      : isEqual(value, goal)

    return stop
  })
}
