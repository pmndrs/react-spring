import createMockRaf, { MockRaf } from 'mock-raf'
import { flushMicroTasks } from 'flush-microtasks'
import { act } from '@testing-library/react'
import {
  isEqual,
  is,
  colors,
  frameLoop,
  addFluidObserver,
  removeFluidObserver,
  getFluidObservers,
} from '@react-spring/shared'
import { __raf as raf } from '@react-spring/rafz'

import { Globals, Controller, FrameValue, SpringValue } from '../src/index'
import { computeGoal } from '../src/helpers'

declare global {
  namespace NodeJS {
    interface Global {
      mockRaf: MockRaf

      advance: (n?: number) => Promise<void>
      advanceByTime: (ms: number) => Promise<void>
      advanceUntil: (test: () => boolean) => Promise<void>
      advanceUntilIdle: () => Promise<void>
      advanceUntilValue: <T>(spring: FrameValue<T>, value: T) => Promise<void>

      /** Take an array of values (one per animation frame) from internal test storage  */
      getFrames: <T>(
        target: FrameValue<T> | Controller<Extract<T, object>>,
        preserve?: boolean
      ) => T[]

      /** Count the number of bounces in a spring animation */
      countBounces: (spring: SpringValue<number>) => number

      // @ts-ignore
      setTimeout: (handler: Function, ms: number) => number

      setSkipAnimation: (skip: boolean) => void
    }
  }
}

// Allow indefinite tests, since we limit the number of animation frames
// per "advanceUntil" call to 1000. This keeps the "isRunning" variable
// from interfering with the debugger.
jest.setTimeout(6e8)

let isRunning = false
let frameCache: WeakMap<any, any[]>

beforeEach(() => {
  isRunning = true
  frameCache = new WeakMap()
  frameLoop.clear()
  raf.clear()

  global.mockRaf = createMockRaf()
  Globals.assign({
    now: global.mockRaf.now,
    requestAnimationFrame: global.mockRaf.raf,
    colors,
    skipAnimation: false,
    // This lets our useTransition hook force its component
    // to update from within an "onRest" handler.
    batchedUpdates: act,
  })
})

afterEach(() => {
  isRunning = false
})

// This observes every SpringValue animation when "advanceUntil" is used.
// Any changes between frames are not recorded.
const frameObserver = (event: FrameValue.Event) => {
  const spring = event.parent
  if (event.type == 'change') {
    let frames = frameCache.get(spring)
    if (!frames) frameCache.set(spring, (frames = []))
    frames.push(event.value)
  }
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
        global.getFrames(spring, preserve).forEach((value, i) => {
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
  global.getFrames(spring, true).forEach(value => {
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
        getFluidObservers(value)?.forEach(observe)
        addFluidObserver(value, frameObserver)
        values.push(value)
      }
    }

    Globals.assign({
      willAdvance: observe,
    })

    jest.advanceTimersByTime(1000 / 60)
    global.mockRaf.step()

    // Stop observing after the frame is processed.
    for (const value of values) {
      removeFluidObserver(value, frameObserver)
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
  return global.advanceUntil(() => --n < 0)
}

global.advanceByTime = ms => {
  let fired = false
  setTimeout(() => (fired = true), ms)
  return global.advanceUntil(() => fired)
}

global.advanceUntilIdle = () => {
  return global.advanceUntil(() => frameLoop.idle && raf.count() == 0)
}

// TODO: support "value" as an array or animatable string
global.advanceUntilValue = (spring, value) => {
  const from = computeGoal(spring.get())
  const goal = computeGoal(value)

  const offset = global.getFrames(spring, true).length
  return global.advanceUntil(() => {
    const frames = global.getFrames(spring, true)
    const value = frames.length - offset > 0 ? frames[frames.length - 1] : from

    const stop = is.num(goal)
      ? goal > from
        ? goal <= value
        : goal >= value
      : isEqual(value, goal)

    return stop
  })
}

global.setSkipAnimation = skip => {
  Globals.assign({
    skipAnimation: skip,
  })
}
