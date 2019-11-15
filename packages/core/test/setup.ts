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

global.getFrames = (arg: SpringValue | Controller) => {
  const { frames, testIdle, reset } = getTestHelpers(arg)
  // expect(spring.animation.values).not.toEqual([])

  let steps = 0
  while (!testIdle()) {
    mockRaf.step()
    if (++steps > 1e5) {
      throw Error('Infinite loop detected')
    }
  }

  reset()
  return frames
}

global.getAsyncFrames = async ctrl => {
  const { frames, testIdle, reset } = getTestHelpers(ctrl)

  let steps = 0
  while (!testIdle()) {
    mockRaf.step()
    await Promise.resolve()
    if (++steps > 1e5) {
      throw Error('Infinite loop detected')
    }
  }

  reset()
  return frames
}

function getTestHelpers(arg: Controller<any> | SpringValue<any>) {
  const frames: any[] = []

  const ctrl = arg instanceof Controller ? arg : null
  if (ctrl) {
    const { onFrame } = ctrl['_state']
    ctrl['_state'].onFrame = (frame: any) => {
      frames.push(frame)
      if (onFrame) onFrame(frame)
    }
    return {
      frames,
      testIdle: () =>
        !ctrl['_state'].promise &&
        Object.values(ctrl.springs).every(spring => spring!.idle),
      reset() {
        ctrl['_state'].onFrame = onFrame
      },
    }
  }

  const spring = arg instanceof SpringValue ? arg : null
  if (spring) {
    const onChange = spring['_onChange']
    spring['_onChange'] = (value, idle) => {
      frames.push(value)
      onChange.call(spring, value, idle)
    }
    return {
      frames,
      testIdle: () => spring.idle && !spring['_state'].promise,
      reset() {
        spring['_onChange'] = onChange
      },
    }
  }

  throw Error('Invalid argument')
}
