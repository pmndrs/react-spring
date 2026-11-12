import { Controller } from './Controller'

for (const cancel of [false, true]) {
  describe(`Controller reentrant stop(${cancel})`, () => {
    it('settles a pause callback stop before a later resume', async () => {
      const ctrl = new Controller<{ x: number }>({ x: 0 })
      const resolved = vi.fn()
      const onStart = vi.fn()
      const loop = vi.fn(() => false)
      const onPause = vi.fn(() => ctrl.stop(cancel))
      ctrl
        .start({
          to: { x: 1 },
          pause: true,
          loop,
          onStart,
          default: { onPause },
          config: { duration: 80 },
        })
        .then(resolved)
      await global.advance(32)
      expect(resolved).toHaveBeenCalledExactlyOnceWith({
        value: 0,
        finished: false,
        cancelled: cancel,
      })
      expect(onPause).toHaveBeenCalledTimes(1)
      expect(ctrl['_state'].resumeQueue.size).toBe(0)
      expect(ctrl['_state'].stopQueue?.size).toBe(0)
      ctrl.resume()
      await global.advance(32)
      expect(ctrl.get()).toEqual({ x: 0 })
      expect(onStart).not.toHaveBeenCalled()
      expect(loop).not.toHaveBeenCalled()
      expect(resolved).toHaveBeenCalledTimes(1)

      const fresh = vi.fn()
      ctrl.start({ to: { x: 2 }, config: { duration: 80 } }).then(fresh)
      await global.advance(32)
      expect(ctrl.get()).toEqual({ x: 2 })
      expect(fresh).toHaveBeenCalledTimes(1)
      expect(fresh.mock.calls[0][0]).toMatchObject({
        finished: true,
        cancelled: false,
      })
    })

    it('does not dispatch later keys after the first child stops the update', async () => {
      const ctrl = new Controller<{ x: number; y: number }>({ x: 0, y: 0 })
      const resolved = vi.fn()
      const onStart = vi.fn()
      const onPause = vi.fn(() => ctrl.stop(cancel))
      ctrl
        .start({
          to: { x: 1, y: 1 },
          pause: true,
          onStart,
          default: { onPause },
          config: { duration: 80 },
        })
        .then(resolved)
      await global.advance(32)
      expect(resolved).toHaveBeenCalledExactlyOnceWith({
        value: { x: 0, y: 0 },
        finished: false,
        cancelled: cancel,
      })
      expect(onPause).toHaveBeenCalledTimes(1)
      ctrl.resume()
      await global.advance(32)
      expect(ctrl.get()).toEqual({ x: 0, y: 0 })
      expect(onStart).not.toHaveBeenCalled()
      expect(resolved).toHaveBeenCalledTimes(1)
    })

    it('does not install an async target after a child stops the update', async () => {
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
          default: { onPause: () => ctrl.stop(cancel) },
          config: { duration: 80 },
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
      expect(resolved).toHaveBeenCalledTimes(1)
    })

    it('keeps other keys and the parent gate on a keyed callback stop', async () => {
      const ctrl = new Controller<{ x: number; y: number }>({ x: 0, y: 0 })
      const resolved = vi.fn()
      let stopped = false
      const onPause = vi.fn(() => {
        if (!stopped) {
          stopped = true
          ctrl.stop(cancel, ['x'])
        }
      })
      ctrl
        .start({
          to: { x: 1, y: 1 },
          pause: true,
          default: { onPause },
          config: { duration: 80 },
        })
        .then(resolved)
      await global.advance(16)
      expect(resolved).not.toHaveBeenCalled()
      expect(onPause).toHaveBeenCalledTimes(2)
      expect(ctrl.get()).toEqual({ x: 0, y: 0 })
      ctrl.resume()
      await global.advance(32)
      expect(resolved).toHaveBeenCalledExactlyOnceWith({
        value: { x: 0, y: 1 },
        finished: false,
        cancelled: cancel,
      })
      expect(ctrl.get()).toEqual({ x: 0, y: 1 })
      expect(ctrl['_state'].stopQueue?.size).toBe(0)
    })

    it('keeps a fresh start from inside the callback after stopping the old update', async () => {
      const ctrl = new Controller<{ x: number; y: number }>({ x: 0, y: 0 })
      const resolved = vi.fn()
      const fresh = vi.fn()
      const onPause = vi.fn(() => {
        ctrl.stop(cancel)
        ctrl
          .start({
            to: { x: 2, y: 2 },
            pause: false,
            loop: false,
            config: { duration: 80 },
          })
          .then(fresh)
      })
      ctrl
        .start({
          to: { x: 1, y: 1 },
          pause: true,
          default: { onPause },
          config: { duration: 80 },
        })
        .then(resolved)
      await global.advance(32)
      expect(resolved).toHaveBeenCalledTimes(1)
      expect(resolved.mock.calls[0][0]).toMatchObject({
        finished: false,
        cancelled: cancel,
      })
      expect(fresh).toHaveBeenCalledTimes(1)
      expect(fresh.mock.calls[0][0]).toMatchObject({
        finished: true,
        cancelled: false,
      })
      expect(ctrl.get()).toEqual({ x: 2, y: 2 })
      expect(onPause).toHaveBeenCalledTimes(1)
      ctrl.resume()
      await global.advance(32)
      expect(ctrl.get()).toEqual({ x: 2, y: 2 })
    })
  })
}

describe('Controller callback controls', () => {
  it('permits a normal parent resume inside the child pause callback', async () => {
    const ctrl = new Controller<{ x: number }>({ x: 0 })
    const resolved = vi.fn()
    const onPause = vi.fn(() => ctrl.resume())
    ctrl
      .start({
        to: { x: 1 },
        pause: true,
        default: { onPause },
        config: { duration: 80 },
      })
      .then(resolved)
    await global.advance(32)
    expect(resolved).toHaveBeenCalledExactlyOnceWith({
      value: 1,
      finished: true,
      cancelled: false,
    })
    expect(onPause).toHaveBeenCalledTimes(1)
    expect(ctrl.get()).toEqual({ x: 1 })
    expect(ctrl['_state'].stopQueue?.size).toBe(0)
  })

  it('does not treat a newer loop intent as a full stop', async () => {
    const ctrl = new Controller<{ x: number }>({ x: 0 })
    const resolved = vi.fn()
    const fresh = vi.fn()
    const loop = vi.fn(() => false)
    const onPause = vi.fn(() => {
      ctrl
        .start({
          to: { x: 2 },
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
        loop,
        default: { onPause },
        config: { duration: 80 },
      })
      .then(resolved)
    await global.advance(32)
    expect(resolved).toHaveBeenCalledTimes(1)
    expect(resolved.mock.calls[0][0].cancelled).toBe(false)
    expect(fresh).toHaveBeenCalledTimes(1)
    expect(fresh.mock.calls[0][0]).toMatchObject({
      finished: true,
      cancelled: false,
    })
    expect(ctrl.get()).toEqual({ x: 2 })
    expect(loop).not.toHaveBeenCalled()
    expect(ctrl['_state'].stopQueue?.size).toBe(0)
  })
})
