import { Controller } from './Controller'

describe('Controller', () => {
  it('can animate a number', () => {
    const ctrl = new Controller({ x: 0 })
    ctrl.start({ x: 100 })

    const frames = getFrames(ctrl)
    expect(frames).toMatchSnapshot()

    // The first frame should *not* be the from value.
    expect(frames[0]).not.toEqual({ x: 0 })

    // The last frame should be the goal value.
    expect(frames.slice(-1)[0]).toEqual({ x: 100 })
  })

  it('can animate an array of numbers', () => {
    const config = { precision: 0.005 }
    const ctrl = new Controller<{ x: [number, number] }>({ x: [1, 2], config })
    ctrl.start({ x: [5, 10] })

    const frames = getFrames(ctrl)
    expect(frames).toMatchSnapshot()

    // The last frame should be the goal value.
    expect(frames.slice(-1)[0]).toEqual({ x: [5, 10] })

    // The 2nd value is always ~2x the 1st value (within the defined precision).
    const factors = frames.map(frame => frame.x[1] / frame.x[0])
    expect(
      factors.every(factor => Math.abs(2 - factor) < config.precision)
    ).toBeTruthy()
  })

  describe('when the "to" prop is an async function', () => {
    it('acts strangely without the "from" prop', async () => {
      const ctrl = new Controller<{ x: number }>()

      const { springs } = ctrl
      ctrl.start({
        to: async update => {
          // The spring does not exist yet!
          expect(springs.x).toBeUndefined()

          // Any values passed here are treated as "from" values,
          // because no "from" prop was ever given.
          update({ x: 1 })
          // Now the spring exists!
          expect(springs.x).toBeDefined()
          // But the spring is idle!
          expect(springs.x.idle).toBeTruthy()

          // This call *will* start an animation!
          update({ x: 2 })
          expect(springs.x.idle).toBeFalsy()
        },
      })

      // Since we call `update` twice, frames are generated!
      expect(await getAsyncFrames(ctrl)).toMatchSnapshot()
    })
  })

  describe('when the "onStart" prop is defined', () => {
    it('is called once per "start" call maximum', () => {
      const ctrl = new Controller({ x: 0, y: 0 })

      const onStart = jest.fn()
      ctrl.start({
        x: 1,
        y: 1,
        onStart,
      })

      advanceUntilIdle()
      expect(onStart).toBeCalledTimes(1)
    })

    it('can be different per key', () => {
      const ctrl = new Controller({ x: 0, y: 0 })

      const onStart1 = jest.fn()
      ctrl.start({ x: 1, onStart: onStart1 })

      const onStart2 = jest.fn()
      ctrl.start({ y: 1, onStart: onStart2 })

      advanceUntilIdle()
      expect(onStart1).toBeCalledTimes(1)
      expect(onStart2).toBeCalledTimes(1)
    })
  })
})
