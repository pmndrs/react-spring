import { Controller } from './Controller'
import { SpringRef } from './SpringRef'
import { SpringValue } from './SpringValue'

const factories = {
  Controller: () => {
    const target = new Controller({ x: 0 })
    return {
      start: (props: any) =>
        target.start({ to: { x: 1 }, config: { duration: 80 }, ...props }),
      stop: (cancel?: boolean) => target.stop(!!cancel),
      resume: () => target.resume(),
      pause: () => target.pause(),
      value: () => target.get().x,
      state: () => target.springs.x['_state'],
    }
  },
  SpringValue: () => {
    const target = new SpringValue(0)
    return {
      start: (props: any) =>
        target.start({ to: 1, config: { duration: 80 }, ...props }),
      stop: (cancel?: boolean) => target.stop(!!cancel),
      resume: () => target.resume(),
      pause: () => target.pause(),
      value: () => target.get(),
      state: () => target['_state'],
    }
  },
}

for (const [kind, create] of Object.entries(factories)) {
  describe(`${kind} scheduled starts`, () => {
    for (const waiting of ['delayed', 'paused'] as const) {
      for (const cancel of [true, false]) {
        it(`settles ${waiting} starts on stop(${cancel})`, async () => {
          const target = create()
          const resolved = vi.fn()
          const onStart = vi.fn()
          const props = waiting === 'delayed' ? { delay: 200 } : { pause: true }
          target.start({ ...props, onStart }).then(resolved)
          target.stop(cancel)

          await global.advance(32)
          expect(resolved).toHaveBeenCalledExactlyOnceWith({
            value: 0,
            finished: false,
            cancelled: cancel,
          })
          expect(onStart).not.toHaveBeenCalled()
          expect(target.value()).toBe(0)
          expect(target.state().timeouts.size).toBe(0)
          expect(target.state().pauseQueue.size).toBe(0)
          expect(target.state().resumeQueue.size).toBe(0)
          expect(target.state().stopQueue?.size).toBe(0)
          expect(target.state().delayed).toBe(false)

          target.resume()
          await global.advance(32)
          expect(target.value()).toBe(0)
          expect(resolved).toHaveBeenCalledTimes(1)
          expect(onStart).not.toHaveBeenCalled()

          const next = vi.fn()
          target.start({ pause: false }).then(next)
          await global.advance(32)
          expect(target.value()).toBe(1)
          expect(next).toHaveBeenCalledWith({
            value: 1,
            finished: true,
            cancelled: false,
          })
          expect(target.state().stopQueue?.size).toBe(0)
        })
      }

      it(`completes ${waiting} starts naturally`, async () => {
        const target = create()
        const resolved = vi.fn()
        target
          .start(waiting === 'delayed' ? { delay: 200 } : { pause: true })
          .then(resolved)
        if (waiting === 'paused') target.resume()
        await global.advance(32)
        expect(target.value()).toBe(1)
        expect(resolved).toHaveBeenCalledExactlyOnceWith({
          value: 1,
          finished: true,
          cancelled: false,
        })
        expect(target.state().stopQueue?.size).toBe(0)
      })
    }

    it('cancels waiting starts through the default cancel prop', async () => {
      const target = create()
      const first = vi.fn()
      const second = vi.fn()
      target.start({ delay: 200 }).then(first)
      target.start({ delay: 300 }).then(second)
      target.start({ default: { cancel: true } })
      await global.advance(32)
      for (const resolved of [first, second]) {
        expect(resolved).toHaveBeenCalledExactlyOnceWith({
          value: 0,
          finished: false,
          cancelled: true,
        })
      }
      expect(target.value()).toBe(0)
      expect(target.state().stopQueue?.size).toBe(0)
    })

    it('preserves the remaining delay across pause and resume', async () => {
      const target = create()
      const resolved = vi.fn()
      target.start({ delay: 200 }).then(resolved)
      await global.advance(3)
      target.pause()
      await global.advance(32)
      expect(resolved).not.toHaveBeenCalled()
      expect(target.value()).toBe(0)
      target.resume()
      await global.advance(2)
      expect(target.value()).toBe(0)
      expect(resolved).not.toHaveBeenCalled()
      await global.advance(32)
      expect(target.value()).toBe(1)
      expect(resolved).toHaveBeenCalledTimes(1)
      expect(target.state().stopQueue?.size).toBe(0)
    })
  })
}

describe('scheduled Controller cancellation', () => {
  it.each(['method', 'prop'] as const)(
    'leaves other keys running when cancelled by %s',
    async source => {
      const ctrl = new Controller({ x: 0, y: 0 })
      const resolved = vi.fn()
      ctrl
        .start({ to: { x: 1, y: 1 }, delay: 200, config: { duration: 80 } })
        .then(resolved)
      if (source === 'method') ctrl.stop(true, ['x'])
      else ctrl.start({ cancel: key => key === 'x' })
      await global.advance(32)
      expect(ctrl.get()).toEqual({ x: 0, y: 1 })
      expect(resolved).toHaveBeenCalledExactlyOnceWith({
        value: { x: 0, y: 1 },
        finished: false,
        cancelled: true,
      })
    }
  )

  it.each(['delayed', 'paused', 'step'] as const)(
    'settles an async sequence cancelled while %s',
    async waiting => {
      const ctrl = new Controller({ x: 0 })
      const resolved = vi.fn()
      const onStart = vi.fn()
      ctrl
        .start({
          to: [{ x: 1, delay: 200 }, { x: 2 }],
          delay: waiting === 'delayed' ? 200 : 0,
          pause: waiting === 'paused',
          config: { duration: 80 },
          onStart,
        })
        .then(resolved)
      ctrl.stop(true)
      await global.advance(32)
      expect(resolved).toHaveBeenCalledTimes(1)
      expect(resolved.mock.calls[0][0]).toMatchObject({
        finished: false,
        cancelled: true,
      })
      expect(ctrl.get()).toEqual({ x: 0 })
      expect(onStart).not.toHaveBeenCalled()
      expect(ctrl['_state'].resumeQueue.size).toBe(0)
      expect(ctrl['_state'].stopQueue?.size).toBe(0)
      ctrl.resume()
      await global.advance(32)
      expect(ctrl.get()).toEqual({ x: 0 })
      expect(resolved).toHaveBeenCalledTimes(1)
    }
  )

  it('bails when an async script is stopped while awaiting resume', async () => {
    const ctrl = new Controller({ x: 0 })
    const continued = vi.fn()
    const resolved = vi.fn()
    ctrl
      .start({
        to: async next => {
          await next({ x: 1 })
          continued()
          await next({ x: 2 })
        },
        config: { duration: 80 },
      })
      .then(resolved)
    await global.advance(1)
    ctrl.pause()
    ctrl.springs.x.finish()
    await global.advance(1)
    expect(continued).not.toHaveBeenCalled()
    ctrl.stop(true)
    await global.advance(32)
    expect(resolved).toHaveBeenCalledTimes(1)
    expect(resolved.mock.calls[0][0]).toMatchObject({
      finished: false,
      cancelled: true,
    })
    expect(continued).not.toHaveBeenCalled()
    ctrl.resume()
    await global.advance(32)
    expect(ctrl.get()).toEqual({ x: 1 })
    expect(continued).not.toHaveBeenCalled()
  })

  it('releases a SpringRef completion chain after cancellation', async () => {
    const first = SpringRef<{ x: number }>()
    const second = SpringRef<{ x: number }>()
    const a = new Controller<{ x: number }>({ x: 0 })
    const b = new Controller<{ x: number }>({ x: 0 })
    first.add(a)
    second.add(b)
    a.update({ to: { x: 1 }, delay: 200 })
    b.update({ to: { x: 2 }, config: { duration: 80 } })
    const resolved = vi.fn()
    Promise.all(first.start())
      .then(() => Promise.all(second.start()))
      .then(resolved)
    first.stop(true)
    await global.advance(32)
    expect(a.get()).toEqual({ x: 0 })
    expect(b.get()).toEqual({ x: 2 })
    expect(resolved).toHaveBeenCalledTimes(1)
  })
})
