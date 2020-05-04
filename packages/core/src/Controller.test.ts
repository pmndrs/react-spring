import { Controller } from './Controller'

const frameLength = 1000 / 60

describe('Controller', () => {
  it('can animate a number', async () => {
    const ctrl = new Controller({ x: 0 })
    ctrl.start({ x: 100 })

    await advanceUntilIdle()
    const frames = getFrames(ctrl)
    expect(frames).toMatchSnapshot()

    // The first frame should *not* be the from value.
    expect(frames[0]).not.toEqual({ x: 0 })

    // The last frame should be the goal value.
    expect(frames.slice(-1)[0]).toEqual({ x: 100 })
  })

  it('can animate an array of numbers', async () => {
    const config = { precision: 0.005 }
    const ctrl = new Controller<{ x: [number, number] }>({ x: [1, 2], config })
    ctrl.start({ x: [5, 10] })

    await advanceUntilIdle()
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

      await advanceUntilIdle()

      // Since we call `update` twice, frames are generated!
      expect(getFrames(ctrl)).toMatchSnapshot()
    })

    it('can be cancelled', async () => {
      const ctrl = new Controller({ from: { x: 0 } })
      ctrl.start({
        to: async next => {
          while (true) {
            await next({ x: 1, reset: true })
          }
        },
      })
      const { x } = ctrl.springs
      await advanceUntilValue(x, 0.5)
      await ctrl.start({
        cancel: true,
      })
      expect(ctrl.idle).toBeTruthy()
    })
  })

  describe('when the "onStart" prop is defined', () => {
    it('is called once per "start" call maximum', async () => {
      const ctrl = new Controller({ x: 0, y: 0 })

      const onStart = jest.fn()
      ctrl.start({
        x: 1,
        y: 1,
        onStart,
      })

      await advanceUntilIdle()
      expect(onStart).toBeCalledTimes(1)
    })

    it('can be different per key', async () => {
      const ctrl = new Controller({ x: 0, y: 0 })

      const onStart1 = jest.fn()
      ctrl.start({ x: 1, onStart: onStart1 })

      const onStart2 = jest.fn()
      ctrl.start({ y: 1, onStart: onStart2 })

      await advanceUntilIdle()
      expect(onStart1).toBeCalledTimes(1)
      expect(onStart2).toBeCalledTimes(1)
    })
  })

  describe('the "loop" prop', () => {
    it('can be combined with the "reverse" prop', async () => {
      const ctrl = new Controller({
        t: 1,
        from: { t: 0 },
        config: { duration: frameLength * 3 },
      })

      const { t } = ctrl.springs
      expect(t.get()).toBe(0)

      await advanceUntilIdle()
      expect(t.get()).toBe(1)

      ctrl.start({
        loop: { reverse: true },
      })

      await advanceUntilValue(t, 0)
      await advanceUntilValue(t, 1)
      expect(getFrames(t)).toMatchSnapshot()
    })

    describe('used with multiple values', () => {
      it('loops all values at the same time', async () => {
        const ctrl = new Controller()

        ctrl.start({
          to: { x: 1, y: 1 },
          from: { x: 0, y: 0 },
          config: key => ({ frequency: key == 'x' ? 0.3 : 1 }),
          loop: true,
        })

        const { x, y } = ctrl.springs
        for (let i = 0; i < 2; i++) {
          await advanceUntilValue(y, 1)

          // Both values should equal their "from" value at the same time.
          expect(x.get()).toBe(x.animation.from)
          expect(y.get()).toBe(y.animation.from)
        }
      })
    })

    describe('used when "to" is', () => {
      describe('an async function', () => {
        it('calls the "to" function repeatedly', async () => {
          const ctrl = new Controller({ t: 0 })
          const { t } = ctrl.springs

          let loop = true
          let times = 2

          // Note: This example is silly, since you could use a for-loop
          // to more easily achieve the same result, but it tests the ability
          // to halt a looping script via the "loop" function prop.
          ctrl.start({
            loop: () => loop,
            to: async next => {
              await next({ t: 1 })
              await next({ t: 0 })

              if (times--) return
              loop = false
            },
          })

          await advanceUntilValue(t, 1)
          expect(t.idle).toBeFalsy()

          for (let i = 0; i < 2; i++) {
            await advanceUntilValue(t, 0)
            expect(t.idle).toBeFalsy()

            await advanceUntilValue(t, 1)
            expect(t.idle).toBeFalsy()
          }

          await advanceUntilValue(t, 0)
          expect(t.idle).toBeTruthy()
        })
      })

      describe('an array', () => {
        it('repeats the chain of updates', async () => {
          const ctrl = new Controller({ t: 0 })
          const { t } = ctrl.springs

          let loop = true
          const promise = ctrl.start({
            loop: () => {
              return loop
            },
            from: { t: 0 },
            to: [{ t: 1 }, { t: 2 }],
            config: { duration: 3000 / 60 },
          })

          for (let i = 0; i < 3; i++) {
            await advanceUntilValue(t, 2)
            expect(t.idle).toBeFalsy()

            // Run the first frame of the next loop.
            mockRaf.step()
          }

          loop = false

          await advanceUntilValue(t, 2)
          expect(t.idle).toBeTruthy()

          expect(await promise).toMatchObject({
            value: { t: 2 },
            finished: true,
          })
        })
      })
    })

    describe('used on a noop update', () => {
      it('does not loop', async () => {
        const ctrl = new Controller({ t: 0 })

        const loop = jest.fn(() => true)
        ctrl.start({ t: 0, loop })

        await advanceUntilIdle()
        expect(loop).toBeCalledTimes(0)
      })
    })
  })
})
