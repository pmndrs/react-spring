/* eslint-disable no-var */

// Browser shim: tests written for jsdom/Jest reference `global.X` to access the
// helpers attached in this file. In a real browser there is no `global` — alias
// it to `globalThis` so existing test bodies work unchanged.
;(globalThis as { global?: typeof globalThis }).global = globalThis

import { beforeEach, afterEach, vi } from 'vitest'
import { act } from 'react'
import { configure } from 'vitest-browser-react/pure'
import createMockRaf, { MockRaf } from '@react-spring/mock-raf'
import { flushMicroTasks } from 'flush-microtasks'
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
  var mockRaf: MockRaf

  var advance: (n?: number) => Promise<void>
  var advanceByTime: (ms: number) => Promise<void>
  var advanceUntil: (test: () => boolean) => Promise<void>
  var advanceUntilIdle: () => Promise<void>
  var advanceUntilValue: <T>(spring: FrameValue<T>, value: T) => Promise<void>

  /** Take an array of values (one per animation frame) from internal test storage  */
  var getFrames: <T>(
    target: FrameValue<T> | Controller<Extract<T, object>>,
    preserve?: boolean
  ) => T[]

  /** Count the number of bounces in a spring animation */
  var countBounces: (spring: SpringValue<number>) => number

  // @ts-ignore
  var setTimeout: (handler: Function, ms: number) => number

  var setSkipAnimation: (skip: boolean) => void
}

// Allow indefinite tests, since we limit the number of animation frames
// per "advanceUntil" call to 1000. This keeps the "isRunning" variable
// from interfering with the debugger.
vi.setConfig({ testTimeout: 6e8 })

// Run every render/renderHook under React.StrictMode. If a test passes
// here it passes without StrictMode; the inverse hides real bugs.
configure({ reactStrictMode: true })

let isRunning = false
let frameCache: WeakMap<any, any[]>

beforeEach(() => {
  vi.useFakeTimers()
  isRunning = true
  frameCache = new WeakMap()
  frameLoop.clear()
  raf.clear()

  globalThis.mockRaf = createMockRaf()
  Globals.assign({
    now: globalThis.mockRaf.now,
    requestAnimationFrame: globalThis.mockRaf.raf,
    colors,
    skipAnimation: false,
  })
})

afterEach(() => {
  isRunning = false
  vi.useRealTimers()
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

globalThis.getFrames = (target, preserve) => {
  let frames = frameCache.get(target)!
  if (!preserve) {
    frameCache.delete(target)
  }
  if (!frames) {
    frames = []
    if (target instanceof Controller) {
      target.each(spring => {
        globalThis.getFrames(spring, preserve).forEach((value, i) => {
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

globalThis.countBounces = spring => {
  const { to, from } = spring.animation
  let prev = from
  let count = 0
  globalThis.getFrames(spring, true).forEach(value => {
    if (
      value !== to &&
      is.num(to) &&
      is.num(prev) &&
      value > to !== prev > to
    ) {
      count += 1
    }
    prev = value
  })
  return count
}

globalThis.advanceUntil = async test => {
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

    await act(() => vi.advanceTimersByTimeAsync(1000 / 60))
    globalThis.mockRaf.step()

    // Stop observing after the frame is processed.
    for (const value of values) {
      removeFluidObserver(value, frameObserver)
    }

    // Ensure pending effects are flushed.
    await act(() => flushMicroTasks())

    // Prevent infinite recursion.
    if (++steps > 1e3) {
      throw Error('Infinite loop detected')
    }
  }
}

globalThis.advance = (n = 1) => {
  return globalThis.advanceUntil(() => --n < 0)
}

globalThis.advanceByTime = ms => {
  let fired = false
  setTimeout(() => (fired = true), ms)
  return globalThis.advanceUntil(() => fired)
}

globalThis.advanceUntilIdle = () => {
  return globalThis.advanceUntil(() => frameLoop.idle && raf.count() == 0)
}

// TODO: support "value" as an array or animatable string
globalThis.advanceUntilValue = (spring, value) => {
  const from = computeGoal(spring.get())
  const goal = computeGoal(value)

  const offset = globalThis.getFrames(spring, true).length
  return globalThis.advanceUntil(() => {
    const frames = globalThis.getFrames(spring, true)
    const value = frames.length - offset > 0 ? frames[frames.length - 1] : from

    const stop =
      is.num(goal) && is.num(value) && is.num(from)
        ? goal > from
          ? goal <= value
          : goal >= value
        : isEqual(value, goal)

    return stop
  })
}

globalThis.setSkipAnimation = skip => {
  Globals.assign({
    skipAnimation: skip,
  })
}
