import createMockRaf from 'mock-raf'
import { Globals, SpringValue, Controller } from '..'

beforeEach(() => {
  global.mockRaf = createMockRaf()
  Globals.assign({
    now: mockRaf.now,
    performanceNow: mockRaf.now,
    requestAnimationFrame: mockRaf.raf,
    cancelAnimationFrame: mockRaf.cancel,
  })
})

global.getFrames = (arg: SpringValue | Controller) => {
  const ctrl = arg instanceof Controller ? arg : null
  const spring = arg instanceof SpringValue ? arg : null
  const frames: any[] = []

  const onChange: any = spring
    ? spring.animation.onChange
    : ctrl!['_state'].onFrame

  const observer = (frame: any) => {
    frames.push(frame)
    if (onChange) {
      onChange(frame)
    }
  }

  if (spring) {
    expect(spring.animation.values).not.toEqual([])
    spring.animation.onChange = observer
  } else {
    ctrl!['_state'].onFrame = observer
  }

  let steps = 0
  while (!arg.idle) {
    mockRaf.step()
    if (++steps > 1e5) {
      throw Error('Infinite loop detected')
    }
  }

  return frames
}

global.getAsyncFrames = async ctrl => {
  const frames: any[] = []
  ctrl['_state'].onFrame = frame => frames.push(frame)

  let steps = 0
  while (!ctrl.idle) {
    mockRaf.step()
    await Promise.resolve()
    if (++steps > 1e5) {
      throw Error('Infinite loop detected')
    }
  }

  return frames
}
