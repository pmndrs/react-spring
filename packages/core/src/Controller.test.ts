import { Controller } from './Controller'
import { flushMicroTasks } from 'flush-microtasks'
import { getFinishedResult } from './AnimationResult'

const frameLength = 1000 / 60

describe('Controller', () => {
  it('can animate a number', async () => {
    const ctrl = new Controller({ x: 0 })
    ctrl.start({ x: 100 })

    await global.advanceUntilIdle()
    const frames = global.getFrames(ctrl)
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

    await global.advanceUntilIdle()
    const frames = global.getFrames(ctrl)
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
    it('respects the "cancel" prop', async () => {
      const ctrl = new Controller({ from: { x: 0 } })
      const promise = ctrl.start({
        to: async next => {
          while (true) {
            await next({ x: 1, reset: true })
          }
        },
      })

      const { x } = ctrl.springs
      await global.advanceUntilValue(x, 0.5)

      ctrl.start({ cancel: true })
      await flushMicroTasks()

      expect(ctrl.idle).toBeTruthy()
      expect((await promise).cancelled).toBeTruthy()
    })

    it('respects the "stop" method', async () => {
      const ctrl = new Controller({ from: { x: 0 } })
      const promise = ctrl.start({
        to: async next => {
          while (true) {
            await next({ x: 1, reset: true })
          }
        },
      })

      const { x } = ctrl.springs
      await global.advanceUntilValue(x, 0.5)

      ctrl.stop()

      expect(ctrl.idle).toBeTruthy()
      expect((await promise).finished).toBeFalsy()
    })

    it('respects the "pause" prop', async () => {
      const ctrl = new Controller({ from: { x: 0 } })
      ctrl.start({ pause: true })

      let n = 0
      ctrl.start({
        to: async animate => {
          while (true) {
            n += 1
            await animate({ x: 1, reset: true })
          }
        },
      })

      await flushMicroTasks()
      expect(n).toBe(0)

      ctrl.start({ pause: false })

      await flushMicroTasks()
      expect(n).toBe(1)
    })

    describe('when the "to" prop is changed', () => {
      it('stops the old "to" prop', async () => {
        const ctrl = new Controller({ from: { x: 0 } })

        let n = 0
        const promise = ctrl.start({
          to: async next => {
            while (++n < 5) {
              await next({ x: 1, reset: true })
            }
          },
        })

        await global.advance()
        expect(n).toBe(1)

        ctrl.start({
          to: () => {},
        })

        await global.advanceUntilIdle()
        expect(n).toBe(1)

        expect(await promise).toMatchObject({
          finished: false,
        })
      })
    })

    // This function is the "to" prop's 1st argument.
    describe('the "animate" function', () => {
      it('inherits any default props', async () => {
        const ctrl = new Controller({ from: { x: 0 } })
        const onStart = jest.fn()
        ctrl.start({
          onStart,
          to: async animate => {
            expect(onStart).toBeCalledTimes(0)
            await animate({ x: 1 })
            expect(onStart).toBeCalledTimes(1)
            await animate({ x: 0 })
          },
        })
        await global.advanceUntilIdle()
        expect(onStart).toBeCalledTimes(2)
      })

      it('can start its own async animation', async () => {
        const ctrl = new Controller({ from: { x: 0 } })

        // Call this from inside the nested "to" prop.
        const nestedFn = jest.fn()
        // Call this after the nested "to" prop is done.
        const afterFn = jest.fn()

        ctrl.start({
          to: async animate => {
            await animate({
              to: async animate => {
                nestedFn()
                await animate({ x: 1 })
              },
            })
            afterFn()
          },
        })

        await global.advanceUntilIdle()
        await flushMicroTasks()

        expect(nestedFn).toBeCalledTimes(1)
        expect(afterFn).toBeCalledTimes(1)
      })
    })

    describe('nested async animation', () => {
      it('stops the parent on bail', async () => {
        const ctrl = new Controller({ from: { x: 0 } })
        const { x } = ctrl.springs

        const afterFn = jest.fn()
        ctrl.start({
          to: async animate => {
            await animate({
              to: async animate => {
                await animate({ x: 1 })
              },
            })
            afterFn()
          },
        })

        await global.advanceUntilValue(x, 0.5)
        ctrl.start({ cancel: true })
        await flushMicroTasks()

        expect(ctrl.idle).toBeTruthy()
        expect(afterFn).not.toHaveBeenCalled()
      })
    })

    describe('while paused', () => {
      it('stays paused when its values are force-finished', () => {
        const ctrl = new Controller<{ t: number }>({ t: 0 })
        const { t } = ctrl.springs

        const onRest = jest.fn()
        ctrl.start({
          to: next => next({ t: 1 }),
          onRest,
        })

        global.mockRaf.step()
        ctrl.pause()

        t.finish()
        global.mockRaf.step()

        expect(ctrl['_state'].paused).toBeTruthy()
        expect(onRest).not.toBeCalled()
      })
    })

    it('acts strangely without the "from" prop', async () => {
      const ctrl = new Controller<{ x: number }>()

      const { springs } = ctrl
      const promise = ctrl.start({
        to: async update => {
          // The spring does not exist yet!
          expect(springs.x).toBeUndefined()

          // Any values passed here are treated as "from" values,
          // because no "from" prop was ever given.
          const p1 = update({ x: 1 })
          // Now the spring exists!
          expect(springs.x).toBeDefined()
          // But the spring is idle!
          expect(springs.x.idle).toBeTruthy()

          // This call *will* start an animation!
          const p2 = update({ x: 2 })
          expect(springs.x.idle).toBeFalsy()

          await Promise.all([p1, p2])
        },
      })

      await Promise.all([global.advanceUntilIdle(), promise])
      expect(ctrl.idle).toBeTruthy()

      // Since we call `update` twice, frames are generated!
      expect(global.getFrames(ctrl)).toMatchSnapshot()
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

      await global.advanceUntilIdle()
      expect(onStart).toBeCalledTimes(1)
    })

    it('can be different per key', async () => {
      const ctrl = new Controller({ x: 0, y: 0 })

      const onStart1 = jest.fn()
      ctrl.start({ x: 1, onStart: onStart1 })

      const onStart2 = jest.fn()
      ctrl.start({ y: 1, onStart: onStart2 })

      await global.advanceUntilIdle()
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

      await global.advanceUntilIdle()
      expect(t.get()).toBe(1)

      ctrl.start({
        loop: { reverse: true },
      })

      await global.advanceUntilValue(t, 0)
      await global.advanceUntilValue(t, 1)
      expect(global.getFrames(t)).toMatchSnapshot()
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
          await global.advanceUntilValue(y, 1)

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

          await global.advanceUntilValue(t, 1)
          expect(t.idle).toBeFalsy()

          for (let i = 0; i < 2; i++) {
            await global.advanceUntilValue(t, 0)
            expect(t.idle).toBeFalsy()

            await global.advanceUntilValue(t, 1)
            expect(t.idle).toBeFalsy()
          }

          await global.advanceUntilValue(t, 0)
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
            await global.advanceUntilValue(t, 2)
            expect(t.idle).toBeFalsy()

            // Run the first frame of the next loop.
            global.mockRaf.step()
          }

          loop = false

          await global.advanceUntilValue(t, 2)
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

        await global.advanceUntilIdle()
        expect(loop).toBeCalledTimes(0)
      })
    })

    describe('when "finish" is called while paused', () => {
      async function getPausedLoop() {
        const ctrl = new Controller<{ t: number }>({
          from: { t: 0 }, // FIXME: replace this line with `t: 0,` for a stack overflow
          loop: {
            async to(start) {
              await start({
                t: 1,
                reset: true,
              })
            },
          },
        })

        // Ensure `loop.to` has been called.
        await flushMicroTasks()

        // Apply the first frame.
        global.mockRaf.step()

        ctrl.pause()
        return ctrl
      }

      it('finishes immediately', async () => {
        const ctrl = await getPausedLoop()
        const { t } = ctrl.springs

        expect(t.get()).toBeLessThan(1)
        t.finish()
        expect(t.get()).toBe(1)
      })

      it('does not loop until resumed', async () => {
        const ctrl = await getPausedLoop()
        const { t } = ctrl.springs

        t.finish()
        expect(t.idle).toBeTruthy()
        expect(t.get()).toBe(1)

        // HACK: The internal promise is undefined once resolved.
        const expectResolved = (isResolved: boolean) =>
          !ctrl['_state'].promise == isResolved

        // Resume the paused loop.
        ctrl.resume()

        // Its promise is not resolved yet..
        expectResolved(false)
        expect(t.idle).toBeTruthy()
        expect(t.get()).toBe(1)

        // ..but in the next microtask, it will be..
        await flushMicroTasks()
        expectResolved(true)
        // ..which means the loop restarts!
        expect(t.idle).toBeFalsy()
        expect(t.get()).toBe(0)
      })
    })
  })

  describe('the "stop" method', () => {
    it('prevents any updates with pending delays', async () => {
      const ctrl = new Controller<{ t: number }>({ t: 0 })
      const { t } = ctrl.springs

      ctrl.start({ t: 1, delay: 100 })
      ctrl.stop()

      await global.advanceUntilIdle()
      expect(ctrl['_state'].timeouts.size).toBe(0)
      expect(t['_state'].timeouts.size).toBe(0)
    })

    it('stops the active runAsync call', async () => {
      const ctrl = new Controller<{ t: number }>({ t: 0 })
      ctrl.start({
        to: async animate => {
          await animate({ t: 1 })
        },
      })
      ctrl.stop()
      await global.advanceUntilIdle()
      expect(ctrl['_state'].asyncTo).toBeUndefined()
    })
  })

  describe('events', () => {
    test('events recieve an AnimationResult and the Controller as the first two args', async () => {
      const ctrl = new Controller<{ t: number }>({ t: 0 })

      const onRest = jest.fn()
      const onStart = jest.fn()
      const onChange = jest.fn()

      ctrl.start({
        to: next => next({ t: 1 }),
        onRest,
        onStart,
        onChange,
      })

      global.mockRaf.step()

      expect(onStart).toBeCalledWith(
        getFinishedResult({ t: 0.022634843307857987 }, false),
        ctrl,
        undefined
      )

      expect(onChange).toBeCalledWith(
        getFinishedResult(ctrl.get(), false),
        ctrl,
        undefined
      )

      await global.advanceUntilIdle()

      expect(onRest).toBeCalledWith(
        getFinishedResult(ctrl.get(), true),
        ctrl,
        undefined
      )
    })

    test('events recieve also recieve the item if set as the third', async () => {
      const ctrl = new Controller<{ t: number }>({ t: 0 })

      const item = { msg: 'hello world', key: 1 }
      ctrl.item = item

      const onRest = jest.fn()
      const onStart = jest.fn()
      const onChange = jest.fn()

      ctrl.start({
        to: next => next({ t: 1 }),
        onRest,
        onStart,
        onChange,
      })

      global.mockRaf.step()

      expect(onStart).toBeCalledWith(
        getFinishedResult({ t: 0.022634843307857987 }, false),
        ctrl,
        item
      )

      expect(onChange).toBeCalledWith(
        getFinishedResult(ctrl.get(), false),
        ctrl,
        item
      )

      await global.advanceUntilIdle()

      expect(onRest).toBeCalledWith(
        getFinishedResult(ctrl.get(), true),
        ctrl,
        item
      )
    })
  })
})
