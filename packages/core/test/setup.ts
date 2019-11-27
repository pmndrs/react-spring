import createMockRaf from 'mock-raf'
import { isEqual, is, FrameLoop } from 'shared'

import { Globals, SpringValue, Controller } from '..'
import { computeGoal } from '../src/helpers'

beforeEach(() => {
  global.mockRaf = createMockRaf()
  Globals.assign({
    now: mockRaf.now,
    performanceNow: mockRaf.now,
    requestAnimationFrame: mockRaf.raf,
    cancelAnimationFrame: mockRaf.cancel,
    frameLoop: new FrameLoop(),
  })
})

global.advanceUntil = test => {
  let steps = 0
  while (!test()) {
    mockRaf.step()
    if (++steps > 5e4) {
      throw Error('Infinite loop detected')
    }
  }
}

global.advanceUntilIdle = () => {
  advanceUntil(() => Globals.frameLoop.idle)
}

// TODO: support "value" as an array or animatable string
global.advanceUntilValue = (spring, value) => {
  const goal = computeGoal(value)

  let lastValue: any
  advanceUntil(() => {
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

global.getFrames = (ctrl: SpringValue | Controller) => {
  const frames: any[] = []

  let steps = 0
  while (!ctrl.idle) {
    mockRaf.step()
    frames.push(ctrl.get())
    if (++steps > 1e5) {
      throw Error('Infinite loop detected')
    }
  }

  return frames
}

global.getAsyncFrames = async ctrl => {
  const frames: any[] = []

  let steps = 0
  while (!ctrl.idle) {
    mockRaf.step()
    frames.push(ctrl.get())
    await Promise.resolve()
    if (++steps > 1e5) {
      throw Error('Infinite loop detected')
    }
  }

  return frames
}
