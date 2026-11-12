import { Controller } from './Controller'
import { SpringValue } from './SpringValue'

for (const cancel of [false, true]) {
  describe(`Controller onProps stop(${cancel})`, () => {
    for (const waiting of ['paused', 'delayed'] as const) {
      it(`settles the ${waiting} current child without starting its goal`, async () => {
        const ctrl = new Controller<{ x: number }>({ x: 0 })
        const resolved = vi.fn()
        const onStart = vi.fn()
        const loop = vi.fn(() => false)
        const onProps = vi.fn(() => ctrl.stop(cancel))
        ctrl
          .start({
            to: { x: 1 },
            ...(waiting === 'paused' ? { pause: true } : { delay: 200 }),
            onProps,
            onStart,
            loop,
            config: { duration: 80 },
          })
          .then(resolved)
        await global.advance(32)
        expect(resolved).toHaveBeenCalledExactlyOnceWith({
          value: 0,
          finished: false,
          cancelled: cancel,
        })
        expect(onProps).toHaveBeenCalledTimes(1)
        expect(onStart).not.toHaveBeenCalled()
        expect(loop).not.toHaveBeenCalled()
        expect(ctrl.get()).toEqual({ x: 0 })
        ctrl.resume()
        await global.advance(32)
        expect(resolved).toHaveBeenCalledTimes(1)
        expect(ctrl.get()).toEqual({ x: 0 })
        expect(onStart).not.toHaveBeenCalled()
        expect(loop).not.toHaveBeenCalled()
      })
    }

    for (const waiting of ['paused', 'delayed'] as const) {
      it(`observes a full stop inside a ${waiting} cancellation predicate`, async () => {
        const ctrl = new Controller<{ x: number }>({ x: 0 })
        const resolved = vi.fn()
        const onStart = vi.fn()
        const predicate = vi.fn(() => {
          ctrl.stop(cancel)
          return false
        })
        ctrl
          .start({
            to: { x: 1 },
            ...(waiting === 'paused' ? { pause: true } : { delay: 200 }),
            cancel: predicate,
            onStart,
            config: { duration: 80 },
          })
          .then(resolved)
        await global.advance(32)
        expect(resolved).toHaveBeenCalledExactlyOnceWith({
          value: 0,
          finished: false,
          cancelled: cancel,
        })
        expect(predicate).toHaveBeenCalledTimes(1)
        ctrl.resume()
        await global.advance(32)
        expect(ctrl.get()).toEqual({ x: 0 })
        expect(onStart).not.toHaveBeenCalled()
        expect(resolved).toHaveBeenCalledTimes(1)
      })
    }

    it('keeps a fresh delayed start made by a stopping cancellation predicate', async () => {
      const ctrl = new Controller<{ x: number }>({ from: { x: 0 } })
      const resolved = vi.fn()
      const fresh = vi.fn()
      const predicate = vi.fn(() => {
        ctrl.stop(cancel)
        ctrl
          .start({
            from: { x: 2 },
            to: { x: 3 },
            delay: 200,
            pause: false,
            config: { duration: 80 },
          })
          .then(fresh)
        return false
      })
      ctrl
        .start({ from: { x: 0 }, to: { x: 1 }, pause: true, cancel: predicate })
        .then(resolved)
      expect(ctrl.get()).toEqual({ x: 2 })
      await global.advance(32)
      expect(resolved).toHaveBeenCalledExactlyOnceWith({
        value: 0,
        finished: false,
        cancelled: cancel,
      })
      expect(predicate).toHaveBeenCalledTimes(1)
      expect(fresh).toHaveBeenCalledTimes(1)
      expect(fresh.mock.calls[0][0]).toMatchObject({
        finished: true,
        cancelled: false,
      })
      expect(ctrl.get()).toEqual({ x: 3 })
    })

    for (const stage of ['pause', 'defaultPause', 'delay'] as const) {
      it(`does not install old work after its ${stage} callback stops`, async () => {
        const ctrl = new Controller<{ x: number }>({ x: 0 })
        const resolved = vi.fn()
        const onStart = vi.fn()
        let stopped = false
        const callback = vi.fn(() => {
          if (!stopped) {
            stopped = true
            ctrl.stop(cancel)
          }
          return stage === 'delay' ? 200 : true
        })
        const waiting =
          stage === 'pause'
            ? { pause: () => callback() === true }
            : stage === 'defaultPause'
              ? { default: { pause: () => callback() === true } }
              : { delay: () => Number(callback()) }
        ctrl
          .start({
            to: { x: 1 },
            ...waiting,
            onStart,
            config: { duration: 80 },
          })
          .then(resolved)
        await global.advance(32)
        expect(resolved).toHaveBeenCalledExactlyOnceWith({
          value: 0,
          finished: false,
          cancelled: cancel,
        })
        expect(callback).toHaveBeenCalledTimes(1)
        ctrl.start({ pause: false, default: { pause: false } })
        await global.advance(32)
        expect(ctrl.get()).toEqual({ x: 0 })
        expect(onStart).not.toHaveBeenCalled()
        expect(resolved).toHaveBeenCalledTimes(1)
      })
    }

    it('does not dispatch later keys after stopping the current child', async () => {
      const ctrl = new Controller<{ x: number; y: number }>({ x: 0, y: 0 })
      const resolved = vi.fn()
      const onProps = vi.fn(() => ctrl.stop(cancel))
      ctrl
        .start({
          to: { x: 1, y: 1 },
          pause: true,
          onProps,
          config: { duration: 80 },
        })
        .then(resolved)
      await global.advance(32)
      expect(resolved).toHaveBeenCalledExactlyOnceWith({
        value: { x: 0, y: 0 },
        finished: false,
        cancelled: cancel,
      })
      expect(onProps).toHaveBeenCalledTimes(1)
      ctrl.resume()
      await global.advance(32)
      expect(ctrl.get()).toEqual({ x: 0, y: 0 })
    })

    it('keeps a fresh nested start and its new key independent', async () => {
      const ctrl = new Controller<{ x: number; y: number }>({ x: 0 })
      const resolved = vi.fn()
      const fresh = vi.fn()
      const onProps = vi.fn(() => {
        ctrl.stop(cancel)
        ctrl
          .start({
            to: { x: 2, y: 3 },
            pause: false,
            loop: false,
            config: { duration: 80 },
          })
          .then(fresh)
      })
      ctrl
        .start({
          to: { x: 1 },
          pause: true,
          onProps,
          config: { duration: 80 },
        })
        .then(resolved)
      await global.advance(32)
      expect(resolved).toHaveBeenCalledExactlyOnceWith({
        value: 0,
        finished: false,
        cancelled: cancel,
      })
      expect(fresh).toHaveBeenCalledTimes(1)
      expect(fresh.mock.calls[0][0]).toMatchObject({
        finished: true,
        cancelled: false,
      })
      expect(ctrl.get()).toEqual({ x: 2, y: 3 })
      expect(onProps).toHaveBeenCalledTimes(1)
      ctrl.resume()
      await global.advance(32)
      expect(ctrl.get()).toEqual({ x: 2, y: 3 })
    })

    it('keeps a keyed stop separate from the parent and other keys', async () => {
      const ctrl = new Controller<{ x: number; y: number }>({ x: 0, y: 0 })
      const resolved = vi.fn()
      ctrl
        .start({
          to: { x: 1, y: 1 },
          pause: true,
          onProps: (_props, spring) => {
            if (spring.key === 'x') ctrl.stop(cancel, ['x'])
          },
          config: { duration: 80 },
        })
        .then(resolved)
      await global.advance(16)
      expect(resolved).not.toHaveBeenCalled()
      ctrl.resume()
      await global.advance(32)
      expect(resolved).toHaveBeenCalledExactlyOnceWith({
        value: { x: 0, y: 1 },
        finished: false,
        cancelled: cancel,
      })
      expect(ctrl.get()).toEqual({ x: 0, y: 1 })
    })

    it('retains the first stop flag when the callback stops twice', async () => {
      const ctrl = new Controller<{ x: number }>({ x: 0 })
      const resolved = vi.fn()
      ctrl
        .start({
          to: { x: 1 },
          delay: 200,
          onProps: () => {
            ctrl.stop(cancel)
            ctrl.stop(!cancel)
          },
        })
        .then(resolved)
      await global.advance(32)
      expect(resolved).toHaveBeenCalledExactlyOnceWith({
        value: 0,
        finished: false,
        cancelled: cancel,
      })
      expect(ctrl.get()).toEqual({ x: 0 })
    })

    it('does not launch an async target after the current child stops', async () => {
      const ctrl = new Controller<{ x: number }>({ x: 0 })
      const resolved = vi.fn()
      const script = vi.fn()
      ctrl
        .start({
          to: async next => {
            script()
            await next({ x: 1 })
          },
          pause: true,
          onProps: () => ctrl.stop(cancel),
        })
        .then(resolved)
      await global.advance(32)
      expect(resolved).toHaveBeenCalledExactlyOnceWith({
        value: { x: 0 },
        finished: false,
        cancelled: cancel,
      })
      expect(script).not.toHaveBeenCalled()
      ctrl.resume()
      await global.advance(32)
      expect(ctrl.get()).toEqual({ x: 0 })
      expect(script).not.toHaveBeenCalled()
    })

    it('preserves a fresh paused nested start from an old from value', async () => {
      const ctrl = new Controller<{ x: number }>({ from: { x: 0 } })
      const resolved = vi.fn()
      const fresh = vi.fn()
      ctrl
        .start({
          from: { x: 0 },
          to: { x: 1 },
          onProps: () => {
            ctrl.stop(cancel)
            ctrl
              .start({
                from: { x: 2 },
                to: { x: 3 },
                pause: true,
                config: { duration: 80 },
              })
              .then(fresh)
          },
        })
        .then(resolved)
      await global.advance(16)
      expect(resolved).toHaveBeenCalledExactlyOnceWith({
        value: 0,
        finished: false,
        cancelled: cancel,
      })
      expect(fresh).not.toHaveBeenCalled()
      expect(ctrl.get()).toEqual({ x: 2 })
      ctrl.resume()
      await global.advance(32)
      expect(ctrl.get()).toEqual({ x: 3 })
      expect(fresh).toHaveBeenCalledTimes(1)
      expect(fresh.mock.calls[0][0]).toMatchObject({
        finished: true,
        cancelled: false,
      })
    })

    it('preserves the stop flag for a first-ever keyed child', async () => {
      const ctrl = new Controller<{ x: number }>()
      const resolved = vi.fn()
      ctrl
        .start({
          from: { x: 0 },
          to: { x: 1 },
          pause: true,
          onProps: () => ctrl.stop(cancel, ['x']),
        })
        .then(resolved)
      await global.advance(16)
      expect(resolved).not.toHaveBeenCalled()
      ctrl.resume()
      await global.advance(32)
      expect(resolved).toHaveBeenCalledExactlyOnceWith({
        value: 0,
        finished: false,
        cancelled: cancel,
      })
      expect(ctrl.get()).toEqual({ x: 0 })
    })

    it('preserves the stop flag before a spring has its first call ID', async () => {
      const spring = new SpringValue<number>()
      const resolved = vi.fn()
      spring
        .start({
          from: 0,
          to: 1,
          pause: true,
          onProps: () => spring.stop(cancel),
        })
        .then(resolved)
      await global.advance(16)
      expect(resolved).toHaveBeenCalledExactlyOnceWith({
        value: undefined,
        finished: false,
        cancelled: cancel,
      })
      expect(spring.get()).toBeUndefined()
      const fresh = vi.fn()
      spring.start({ from: 2, to: 3, config: { duration: 80 } }).then(fresh)
      await global.advance(32)
      expect(spring.get()).toBe(3)
      expect(fresh).toHaveBeenCalledTimes(1)
      expect(fresh.mock.calls[0][0]).toMatchObject({
        finished: true,
        cancelled: false,
      })
    })

    it('observes a stop while preparing the current initial value', async () => {
      const spring = new SpringValue(0)
      const resolved = vi.fn()
      spring
        .start({
          from: 1,
          to: 2,
          pause: true,
          default: { onChange: () => spring.stop(cancel) },
        })
        .then(resolved)
      await global.advance(16)
      expect(resolved).toHaveBeenCalledExactlyOnceWith({
        value: 1,
        finished: false,
        cancelled: cancel,
      })
      spring.resume()
      await global.advance(32)
      expect(spring.get()).toBe(1)
    })

    it('settles a standalone spring stopped by its own onProps callback', async () => {
      const spring = new SpringValue(0)
      const resolved = vi.fn()
      spring
        .start({
          to: 1,
          pause: true,
          onProps: () => spring.stop(cancel),
        })
        .then(resolved)
      await global.advance(32)
      expect(resolved).toHaveBeenCalledExactlyOnceWith({
        value: 0,
        finished: false,
        cancelled: cancel,
      })
      spring.resume()
      await global.advance(32)
      expect(spring.get()).toBe(0)
    })
  })
}

describe('onProps stop ownership controls', () => {
  it.each(['cancel', 'default'] as const)(
    'preserves a %s cancellation request',
    async source => {
      const ctrl = new Controller<{ x: number }>({ x: 0 })
      const resolved = vi.fn()
      const onProps = vi.fn(() => ctrl.stop(false))
      ctrl
        .start({
          to: { x: 1 },
          pause: true,
          onProps,
          ...(source === 'cancel'
            ? { cancel: true }
            : { default: { cancel: true } }),
        })
        .then(resolved)
      await global.advance(32)
      expect(resolved).toHaveBeenCalledTimes(1)
      expect(resolved.mock.calls[0][0]).toMatchObject({
        finished: false,
        cancelled: true,
      })
      expect(resolved.mock.calls[0][0].value).toBe(ctrl.springs.x)
      expect(ctrl.get()).toEqual({ x: 0 })
      expect(onProps).toHaveBeenCalledTimes(1)
    }
  )

  for (const source of ['cancel', 'default'] as const) {
    it.each([false, true])(
      `evaluates a ${source} cancellation predicate once after onProps stop (%s)`,
      async cancelled => {
        const spring = new SpringValue(0)
        const resolved = vi.fn()
        const predicate = vi.fn(() => cancelled)
        spring.key = 'x'
        spring
          .start({
            to: 1,
            pause: true,
            onProps: () => spring.stop(false),
            ...(source === 'cancel'
              ? { cancel: predicate }
              : { default: { cancel: predicate } }),
          })
          .then(resolved)
        await global.advance(16)
        expect(predicate).toHaveBeenCalledTimes(1)
        expect(resolved).toHaveBeenCalledTimes(1)
        expect(resolved.mock.calls[0][0]).toEqual({
          value: cancelled ? spring : 0,
          finished: false,
          cancelled,
        })
        expect(spring.get()).toBe(0)
      }
    )
  }

  it('preserves rejection from a cancellation predicate after onProps stop', async () => {
    const spring = new SpringValue(0)
    const error = new Error('cancel predicate failed')
    spring.key = 'x'
    await expect(
      spring.start({
        to: 1,
        onProps: () => spring.stop(false),
        cancel: () => {
          throw error
        },
      })
    ).rejects.toBe(error)
    expect(spring['_state'].stopQueue?.size).toBe(0)
  })

  it.each(['pause', 'delay'] as const)(
    'rejects a throwing %s callback without leaving its old goal queued',
    async stage => {
      const spring = new SpringValue(0)
      const error = new Error('scheduler callback failed')
      const props =
        stage === 'pause'
          ? {
              pause: true,
              default: {
                onPause: () => {
                  throw error
                },
              },
            }
          : {
              delay: () => {
                throw error
              },
            }
      await expect(spring.start({ to: 1, ...props })).rejects.toBe(error)
      expect(spring['_state'].resumeQueue.size).toBe(0)
      expect(spring['_state'].stopQueue?.size).toBe(0)
      spring.resume()
      await global.advance(32)
      expect(spring.get()).toBe(0)
    }
  )

  it('keeps a fresh delay when a stopping cancellation predicate then throws', async () => {
    const ctrl = new Controller<{ x: number }>({ from: { x: 0 } })
    const fresh = vi.fn()
    const error = new Error('cancel predicate failed')
    await expect(
      ctrl.start({
        to: { x: 1 },
        pause: true,
        cancel: () => {
          ctrl.stop(false)
          ctrl
            .start({
              from: { x: 2 },
              to: { x: 3 },
              pause: false,
              delay: 200,
              config: { duration: 80 },
            })
            .then(fresh)
          throw error
        },
      })
    ).rejects.toBe(error)
    expect(ctrl.springs.x.isDelayed).toBe(true)
    await global.advance(32)
    expect(ctrl.get()).toEqual({ x: 3 })
    expect(fresh).toHaveBeenCalledTimes(1)
    expect(fresh.mock.calls[0][0]).toMatchObject({
      finished: true,
      cancelled: false,
    })
  })

  it('preserves synchronous callback errors and permits a later start', async () => {
    const spring = new SpringValue(0)
    const error = new Error('onProps failed')
    expect(() =>
      spring.start({
        to: 1,
        onProps: () => {
          throw error
        },
      })
    ).toThrow(error)
    const resolved = vi.fn()
    spring.start({ to: 2, config: { duration: 80 } }).then(resolved)
    await global.advance(32)
    expect(spring.get()).toBe(2)
    expect(resolved).toHaveBeenCalledTimes(1)
    expect(spring['_state'].stopQueue?.size).toBe(0)
  })

  it('preserves frozen-spring errors even after an onProps stop', () => {
    const spring = new SpringValue(0)
    const predicate = vi.fn(() => {
      throw new Error('cancel predicate failed')
    })
    spring.key = 'x'
    Object.freeze(spring)
    expect(() =>
      spring.start({ to: 1, onProps: () => spring.stop(), cancel: predicate })
    ).toThrow('Cannot animate a `SpringValue` object that is frozen.')
    expect(predicate).not.toHaveBeenCalled()
    expect(spring['_state'].stopQueue?.size).toBe(0)
  })
})
