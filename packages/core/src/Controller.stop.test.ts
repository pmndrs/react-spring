import { Controller } from './Controller'
import { SpringValue } from './SpringValue'

async function heldLoop() {
  const ctrl = new Controller({ x: 0 })
  const resolved = vi.fn()
  const loop = vi.fn(() => false)
  ctrl
    .start({
      from: { x: 0 },
      to: { x: 1 },
      pause: true,
      loop,
      config: { duration: 80 },
    })
    .then(resolved)
  ctrl.springs.x.resume()
  await global.advance(16)
  expect(ctrl.get()).toEqual({ x: 1 })
  expect(ctrl['_state'].paused).toBe(true)
  expect(resolved).not.toHaveBeenCalled()
  expect(loop).not.toHaveBeenCalled()
  return { ctrl, resolved, loop }
}

describe('Controller stopped pause gates', () => {
  it.each([false, true])('settles completed children (%s)', async cancel => {
    const { ctrl, resolved, loop } = await heldLoop()
    ctrl.stop(cancel)
    await global.advance(32)
    expect(resolved).toHaveBeenCalledTimes(1)
    expect(resolved.mock.calls[0][0]).toEqual({
      value: 1,
      finished: false,
      cancelled: cancel,
    })
    expect(loop).not.toHaveBeenCalled()
    expect(ctrl['_state'].resumeQueue.size).toBe(0)
    expect(ctrl['_state'].stopQueue?.size).toBe(0)
    expect(ctrl.springs.x['_state'].stopQueue?.size).toBe(0)

    ctrl.resume()
    await global.advance(32)
    expect(ctrl.get()).toEqual({ x: 1 })
    expect(loop).not.toHaveBeenCalled()
    expect(resolved).toHaveBeenCalledTimes(1)

    const fresh = vi.fn()
    ctrl
      .start({ to: { x: 2 }, pause: false, config: { duration: 80 } })
      .then(fresh)
    await global.advance(32)
    expect(ctrl.get()).toEqual({ x: 2 })
    expect(fresh).toHaveBeenCalledTimes(1)
    expect(fresh.mock.calls[0][0]).toMatchObject({
      finished: true,
      cancelled: false,
    })
  })

  it.each(['cancel', 'default'] as const)(
    'settles the old gate and the %s cancellation request',
    async source => {
      const { ctrl, resolved, loop } = await heldLoop()
      const cancellation = vi.fn()
      const props =
        source === 'cancel' ? { cancel: true } : { default: { cancel: true } }
      ctrl.start(props).then(cancellation)
      await global.advance(32)
      for (const completed of [resolved, cancellation]) {
        expect(completed).toHaveBeenCalledTimes(1)
        expect(completed.mock.calls[0][0]).toMatchObject({
          finished: false,
          cancelled: true,
        })
      }
      expect(resolved.mock.calls[0][0].value).toBe(1)
      expect(cancellation.mock.calls[0][0].value).toBe(ctrl.springs.x)
      expect(loop).not.toHaveBeenCalled()
      expect(ctrl['_state'].resumeQueue.size).toBe(0)
      expect(ctrl['_state'].stopQueue?.size).toBe(0)
      ctrl.resume()
      await global.advance(32)
      expect(ctrl.get()).toEqual({ x: 1 })
      expect(loop).not.toHaveBeenCalled()

      const fresh = vi.fn()
      ctrl
        .start({
          to: { x: 2 },
          pause: false,
          cancel: false,
          default: { cancel: false },
          config: { duration: 80 },
        })
        .then(fresh)
      await global.advance(32)
      expect(ctrl.get()).toEqual({ x: 2 })
      expect(fresh).toHaveBeenCalledTimes(1)
    }
  )

  for (const waiting of ['delayed', 'paused'] as const) {
    it.each([false, true])(
      `preserves stop(%s) flags for an async ${waiting} start`,
      async cancel => {
        const ctrl = new Controller({ x: 0 })
        const resolved = vi.fn()
        const onStart = vi.fn()
        ctrl
          .start({
            to: [{ x: 1 }, { x: 2 }],
            delay: waiting === 'delayed' ? 200 : 0,
            pause: waiting === 'paused',
            config: { duration: 80 },
            onStart,
          })
          .then(resolved)
        ctrl.stop(cancel)
        await global.advance(32)
        expect(resolved).toHaveBeenCalledTimes(1)
        expect(resolved.mock.calls[0][0]).toMatchObject({
          finished: false,
          cancelled: cancel,
        })
        expect(onStart).not.toHaveBeenCalled()
        expect(ctrl.get()).toEqual({ x: 0 })
        expect(ctrl['_state'].resumeQueue.size).toBe(0)
        expect(ctrl['_state'].stopQueue?.size).toBe(0)
        ctrl.resume()
        await global.advance(32)
        expect(ctrl.get()).toEqual({ x: 0 })
        expect(resolved).toHaveBeenCalledTimes(1)
        expect(onStart).not.toHaveBeenCalled()
      }
    )
  }

  it.each([false, true])('preserves active async stop(%s)', async cancel => {
    const ctrl = new Controller({ x: 0 })
    const resolved = vi.fn()
    ctrl
      .start({ to: [{ x: 1 }, { x: 2 }], config: { duration: 80 } })
      .then(resolved)
    await global.advance(1)
    const stoppedValue = ctrl.get().x
    expect(stoppedValue).toBeGreaterThan(0)
    expect(stoppedValue).toBeLessThan(1)
    ctrl.stop(cancel)
    await global.advance(32)
    expect(resolved).toHaveBeenCalledTimes(1)
    expect(resolved.mock.calls[0][0]).toMatchObject({
      finished: false,
      cancelled: cancel,
    })
    expect(ctrl.get().x).toBe(stoppedValue)
    ctrl.resume()
    await global.advance(32)
    expect(ctrl.get().x).toBe(stoppedValue)
    expect(resolved).toHaveBeenCalledTimes(1)
  })

  it('cancels before a combined resume can wake old gates', async () => {
    const { ctrl, resolved, loop } = await heldLoop()
    const cancellation = vi.fn()
    ctrl.start({ cancel: true, pause: false }).then(cancellation)
    await global.advance(32)
    for (const completed of [resolved, cancellation]) {
      expect(completed).toHaveBeenCalledTimes(1)
      expect(completed.mock.calls[0][0]).toMatchObject({
        finished: false,
        cancelled: true,
      })
    }
    expect(loop).not.toHaveBeenCalled()
    expect(ctrl['_state'].stopQueue?.size).toBe(0)
    expect(ctrl['_state'].resumeQueue.size).toBe(0)
    expect(ctrl.get()).toEqual({ x: 1 })
  })

  it.each([false, true])(
    'preserves multi-key stop values (%s)',
    async cancel => {
      const ctrl = new Controller({ x: 0, y: 0 })
      const resolved = vi.fn()
      const loop = vi.fn(() => false)
      ctrl
        .start({
          to: { x: 1, y: 2 },
          pause: true,
          loop,
          config: { duration: 80 },
        })
        .then(resolved)
      ctrl.springs.x.resume()
      ctrl.springs.y.resume()
      await global.advance(16)
      expect(ctrl.get()).toEqual({ x: 1, y: 2 })
      expect(resolved).not.toHaveBeenCalled()
      ctrl.stop(cancel)
      await global.advance(32)
      expect(resolved).toHaveBeenCalledExactlyOnceWith({
        value: { x: 1, y: 2 },
        finished: false,
        cancelled: cancel,
      })
      expect(loop).not.toHaveBeenCalled()
      ctrl.resume()
      await global.advance(32)
      expect(loop).not.toHaveBeenCalled()
      expect(resolved).toHaveBeenCalledTimes(1)
    }
  )

  it.each(['cancel', 'default'] as const)(
    'preserves an empty %s cancellation result',
    async source => {
      const ctrl = new Controller()
      const resolved = vi.fn()
      const props =
        source === 'cancel' ? { cancel: true } : { default: { cancel: true } }
      ctrl.start(props).then(resolved)
      await global.advance(1)
      expect(resolved).toHaveBeenCalledExactlyOnceWith({
        value: {},
        finished: false,
        cancelled: true,
      })
    }
  )

  it.each(['cancel', 'default'] as const)(
    'preserves active async %s cancellation values',
    async source => {
      const ctrl = new Controller({ x: 0 })
      const resolved = vi.fn()
      const cancellation = vi.fn()
      ctrl
        .start({ to: [{ x: 1 }, { x: 2 }], config: { duration: 80 } })
        .then(resolved)
      await global.advance(1)
      const stoppedValue = ctrl.get().x
      const props =
        source === 'cancel' ? { cancel: true } : { default: { cancel: true } }
      ctrl.start(props).then(cancellation)
      await global.advance(32)
      for (const completed of [resolved, cancellation]) {
        expect(completed).toHaveBeenCalledExactlyOnceWith({
          value: { x: stoppedValue },
          finished: false,
          cancelled: true,
        })
      }
      expect(ctrl.get().x).toBe(stoppedValue)
    }
  )

  it.each(['cancel', 'default'] as const)(
    'preserves an empty async %s cancellation value',
    async source => {
      const ctrl = new Controller()
      const resolved = vi.fn()
      const script = vi.fn()
      const props =
        source === 'cancel' ? { cancel: true } : { default: { cancel: true } }
      ctrl
        .start({
          to: () => {
            script()
          },
          ...props,
        })
        .then(resolved)
      await global.advance(1)
      expect(resolved).toHaveBeenCalledTimes(1)
      expect(resolved.mock.calls[0][0].value).toBe(ctrl)
      expect(resolved.mock.calls[0][0]).toMatchObject({
        finished: false,
        cancelled: true,
      })
      expect(script).not.toHaveBeenCalled()
    }
  )

  it('keeps other keys and the parent gate on a keyed stop', async () => {
    const ctrl = new Controller({ x: 0, y: 0 })
    const resolved = vi.fn()
    const loop = vi.fn(() => false)
    ctrl
      .start({
        to: { x: 1, y: 1 },
        pause: true,
        loop,
        config: { duration: 80 },
      })
      .then(resolved)
    ctrl.springs.x.resume()
    await global.advance(16)
    ctrl.stop(true, ['x'])
    await global.advance(16)
    expect(ctrl.get()).toEqual({ x: 1, y: 0 })
    expect(resolved).not.toHaveBeenCalled()
    expect(loop).not.toHaveBeenCalled()
    expect(ctrl['_state'].stopQueue?.size).toBe(1)
    ctrl.resume()
    await global.advance(32)
    expect(ctrl.get()).toEqual({ x: 1, y: 1 })
    expect(resolved).toHaveBeenCalledTimes(1)
    expect(resolved.mock.calls[0][0]).toMatchObject({
      finished: true,
      cancelled: false,
    })
    expect(loop).toHaveBeenCalledTimes(1)
    expect(ctrl['_state'].stopQueue?.size).toBe(0)
  })

  it('blocks loops when stop follows a resumed gate', async () => {
    const { ctrl, resolved, loop } = await heldLoop()
    ctrl.resume()
    ctrl.stop(true)
    await global.advance(32)
    expect(resolved).toHaveBeenCalledTimes(1)
    expect(loop).not.toHaveBeenCalled()
    expect(ctrl['_state'].resumeQueue.size).toBe(0)
    expect(ctrl['_state'].stopQueue?.size).toBe(0)
    expect(ctrl.get()).toEqual({ x: 1 })
  })

  it('blocks stale goals after reentrant pause cancellation', async () => {
    const spring = new SpringValue(0)
    const resolved = vi.fn()
    const onStart = vi.fn()
    spring
      .start({
        to: 1,
        pause: true,
        onStart,
        default: { onPause: () => spring.stop(true) },
      })
      .then(resolved)
    await global.advance(32)
    expect(resolved).toHaveBeenCalledTimes(1)
    expect(resolved.mock.calls[0][0]).toMatchObject({
      finished: false,
      cancelled: true,
    })
    spring.resume()
    await global.advance(32)
    expect(spring.get()).toBe(0)
    expect(onStart).not.toHaveBeenCalled()
    expect(resolved).toHaveBeenCalledTimes(1)
    expect(spring['_state'].resumeQueue.size).toBe(0)
    expect(spring['_state'].stopQueue?.size).toBe(0)
  })
})
