import { SpringValue } from './SpringValue'
import { FrameValue } from './FrameValue'
import { flushMicroTasks } from 'flush-microtasks'
import {
  addFluidObserver,
  FluidObserver,
  getFluidObservers,
  Globals,
  removeFluidObserver,
} from '@react-spring/shared'

const frameLength = 1000 / 60

describe('SpringValue', () => {
  it('can animate a number', async () => {
    const spring = new SpringValue(0)
    spring.start(1, {
      config: { duration: 10 * frameLength },
    })
    await advanceUntilIdle()
    const frames = getFrames(spring)
    expect(frames).toMatchSnapshot()
  })

  it('can animate a string', async () => {
    const spring = new SpringValue<string>()
    const promise = spring.start({
      to: '10px 20px',
      from: '0px 0px',
      config: { duration: 10 * frameLength },
    })
    await advanceUntilIdle()
    const frames = getFrames(spring)
    expect(frames).toMatchSnapshot()
    const { finished } = await promise
    expect(finished).toBeTruthy()
  })

  // FIXME: This test fails.
  xit('animates a number the same as a numeric string', async () => {
    const spring1 = new SpringValue(0)
    spring1.start(10)

    await advanceUntilIdle()
    const frames = getFrames(spring1).map(n => n + 'px')

    const spring2 = new SpringValue('0px')
    spring2.start('10px')

    await advanceUntilIdle()
    expect(frames).toEqual(getFrames(spring2))
  })

  it('can animate an array of numbers', async () => {
    const onChange = jest.fn()
    const spring = new SpringValue()
    spring.start({
      to: [10, 20],
      from: [0, 0],
      config: { duration: 10 * frameLength },
      onChange,
    })
    await advanceUntilIdle()
    expect(onChange.mock.calls.slice(-1)[0]).toEqual([
      spring.animation.to,
      spring,
    ])
    expect(getFrames(spring)).toMatchSnapshot()
  })

  it('can have an animated string as its target', async () => {
    const target = new SpringValue('yellow')
    const spring = new SpringValue({
      to: target,
      config: { duration: 10 * frameLength },
    })

    // The target is not attached until the spring is observed.
    addFluidObserver(spring, () => {})

    mockRaf.step()
    target.set('red')

    await advanceUntilIdle()
    expect(getFrames(spring)).toMatchSnapshot()
  })

  describeProps()
  describeEvents()
  describeMethods()
  describeGlobals()

  describeTarget('another SpringValue', from => {
    const node = new SpringValue(from)
    return {
      node,
      set: node.set.bind(node),
      start: node.start.bind(node),
      reset: node.reset.bind(node),
    }
  })

  describeTarget('an Interpolation', from => {
    const parent = new SpringValue(from - 1)
    const node = parent.to(n => n + 1)
    return {
      node,
      set: n => parent.set(n - 1),
      start: n => parent.start(n - 1),
      reset: parent.reset.bind(parent),
    }
  })

  // No-op updates don't change the goal value.
  describe('no-op updates', () => {
    it('resolves when the animation is finished', async () => {
      const spring = new SpringValue(0)
      spring.start(1)

      // Create a no-op update.
      const resolve = jest.fn()
      spring.start(1).then(resolve)

      await flushMicroTasks()
      expect(resolve).not.toBeCalled()

      await advanceUntilIdle()
      expect(resolve).toBeCalled()
    })
  })
})

function describeProps() {
  describeToProp()
  describeFromProp()
  describeResetProp()
  describeDefaultProp()
  describeReverseProp()
  describeImmediateProp()
  describeConfigProp()
  describeLoopProp()
  describeDelayProp()
}

function describeToProp() {
  describe('when "to" prop is changed', () => {
    it.todo('resolves the "start" promise with (finished: false)')
    it.todo('avoids calling the "onStart" prop')
    it.todo('avoids calling the "onRest" prop')
  })

  describe('when "to" prop equals current value', () => {
    it('cancels any pending animation', async () => {
      const spring = new SpringValue(0)
      spring.start(1)

      // Prevent the animation to 1 (which hasn't started yet)
      spring.start(0)

      await advanceUntilIdle()
      expect(getFrames(spring)).toEqual([])
    })

    it('avoids interrupting an active animation', async () => {
      const spring = new SpringValue(0)
      spring.start(1)
      await advance()

      const goal = spring.get()
      spring.start(goal)
      expect(spring.idle).toBeFalsy()

      await advanceUntilIdle()
      expect(spring.get()).toBe(goal)
      expect(getFrames(spring)).toMatchSnapshot()
    })
  })

  describe('when "to" prop is a function', () => {
    describe('and "from" prop is defined', () => {
      it('stops the active animation before "to" is called', () => {
        const spring = new SpringValue({ from: 0, to: 1 })
        mockRaf.step()

        expect.assertions(1)
        spring.start({
          from: 2,
          to: () => {
            expect(spring.get()).toBe(2)
          },
        })
      })
    })
  })
}

function describeFromProp() {
  describe('when "from" prop is defined', () => {
    it.todo('controls the start value')
  })
}

function describeResetProp() {
  describe('when "reset" prop is true', () => {
    it('calls "onRest" before jumping back to its "from" value', async () => {
      const onRest = jest.fn((result: any) => {
        expect(result.value).not.toBe(0)
      })

      const spring = new SpringValue({ from: 0, to: 1, onRest })
      mockRaf.step()

      spring.start({ reset: true })

      expect(onRest).toHaveBeenCalled()
      expect(spring.get()).toBe(0)
    })

    it.todo('resolves the "start" promise with (finished: false)')
    it.todo('calls the "onRest" prop with (finished: false)')
  })
}

function describeDefaultProp() {
  // The hook API always uses { default: true } for render-driven updates.
  // Some props can have default values (eg: onRest, config, etc), and
  // other props may behave differently when { default: true } is used.
  describe('when "default" prop is true', () => {
    describe('and "from" prop is changed', () => {
      describe('before the first animation', () => {
        it('updates the current value', () => {
          const props = { default: true, from: 1, to: 1 }
          const spring = new SpringValue(props)

          expect(spring.get()).toBe(1)
          expect(spring.idle).toBeTruthy()

          props.from = 0
          spring.start(props)

          expect(spring.get()).not.toBe(1)
          expect(spring.idle).toBeFalsy()
        })
      })

      describe('after the first animation', () => {
        it('does not start animating', async () => {
          const props = { default: true, from: 0, to: 2 }
          const spring = new SpringValue(props)
          await advanceUntilIdle()

          props.from = 1
          spring.start(props)

          expect(spring.get()).toBe(2)
          expect(spring.idle).toBeTruthy()
          expect(spring.animation.from).toBe(1)
        })

        describe('and "reset" prop is true', () => {
          it('starts at the "from" prop', async () => {
            const props: any = { default: true, from: 0, to: 2 }
            const spring = new SpringValue(props)
            await advanceUntilIdle()

            props.from = 1
            props.reset = true
            spring.start(props)

            expect(spring.animation.from).toBe(1)
            expect(spring.idle).toBeFalsy()
          })
        })
      })
    })
  })

  describe('when "default" prop is false', () => {
    describe('and "from" prop is defined', () => {
      it('updates the current value', () => {
        const spring = new SpringValue(0)
        spring.start({ from: 1 })
        expect(spring.get()).toBe(1)
      })
      it('updates the "from" value', () => {
        const spring = new SpringValue(0)
        spring.start({ from: 1 })
        expect(spring.animation.from).toBe(1)
      })

      describe('and "to" prop is undefined', () => {
        it('updates the "to" value', () => {
          const spring = new SpringValue(0)
          spring.start({ from: 1 })
          expect(spring.animation.to).toBe(1)
        })
        it('stops the active animation', async () => {
          const spring = new SpringValue(0)

          // This animation will be stopped.
          const promise = spring.start({ from: 0, to: 1 })

          mockRaf.step()
          const value = spring.get()

          spring.start({ from: 0 })
          expect(spring.idle).toBeTruthy()
          expect(spring.animation.to).toBe(0)

          expect(await promise).toMatchObject({
            value,
            finished: false,
          })
        })
      })
    })
  })
}

function describeReverseProp() {
  describe('when "reverse" prop is true', () => {
    it('swaps the "to" and "from" props', async () => {
      const spring = new SpringValue<number>()
      spring.start({ from: 0, to: 1, reverse: true })

      await advanceUntilIdle()
      expect(getFrames(spring)).toMatchSnapshot()
    })

    it('works when "to" and "from" were set by an earlier update', async () => {
      // TODO: remove the need for "<number>"
      const spring = new SpringValue<number>({ from: 0, to: 1 })
      await advanceUntilValue(spring, 0.5)

      spring.start({ reverse: true })
      expect(spring.animation).toMatchObject({
        from: 1,
        to: 0,
      })

      await advanceUntilIdle()
      expect(getFrames(spring)).toMatchSnapshot()
    })

    it('works when "from" was set by an earlier update', async () => {
      const spring = new SpringValue(0)
      expect(spring.animation.from).toBe(0)
      spring.start({ to: 1, reverse: true })

      await advanceUntilIdle()
      expect(getFrames(spring)).toMatchSnapshot()
    })

    it('preserves the reversal for future updates', async () => {
      const spring = new SpringValue(0)
      spring.start({ to: 1, reverse: true })
      expect(spring.animation).toMatchObject({
        to: 0,
        from: 1,
      })

      await advanceUntilIdle()

      spring.start({ to: 2 })
      expect(spring.animation).toMatchObject({
        to: 2,
        from: 1,
      })
    })
  })
}

function describeImmediateProp() {
  describe('when "immediate" prop is true', () => {
    it.todo('still resolves the "start" promise')
    it.todo('never calls the "onStart" prop')
    it.todo('never calls the "onRest" prop')

    it('stops animating', async () => {
      const spring = new SpringValue(0)
      spring.start(2)
      await advanceUntilValue(spring, 1)

      // Use "immediate" to emulate the "stop" method. (see #884)
      const value = spring.get()
      spring.start(value, { immediate: true })

      // The "immediate" prop waits until the next frame before going idle.
      mockRaf.step()

      expect(spring.idle).toBeTruthy()
      expect(spring.get()).toBe(value)
    })
  })

  describe('when "immediate: true" is followed by "immediate: false" in same frame', () => {
    it('applies the immediate goal synchronously', () => {
      const spring = new SpringValue(0)

      // The immediate update is applied in the next frame.
      spring.start({ to: 1, immediate: true })
      expect(spring.get()).toBe(0)

      // But when an animated update is merged before the next frame,
      // the immediate update is applied synchronously.
      spring.start({ to: 2 })
      expect(spring.get()).toBe(1)
      expect(spring.animation).toMatchObject({
        fromValues: [1],
        toValues: [2],
      })
    })

    it('does nothing if the 2nd update has "reset: true"', () => {
      const spring = new SpringValue(0)

      // The immediate update is applied in the next frame.
      spring.start({ to: 1, immediate: true })
      expect(spring.get()).toBe(0)

      // But when an animated update is merged before the next frame,
      // the immediate update is applied synchronously.
      spring.start({ to: 2, reset: true })
      expect(spring.get()).toBe(0)
      expect(spring.animation).toMatchObject({
        fromValues: [0],
        toValues: [2],
      })
    })
  })
}

function describeConfigProp() {
  describe('the "config" prop', () => {
    it('resets the velocity when "to" changes', () => {
      const spring = new SpringValue(0)
      spring.start({ to: 100, config: { velocity: 10 } })

      const { config } = spring.animation
      expect(config.velocity).toBe(10)

      // Preserve velocity if "to" did not change.
      spring.start({ config: { tension: 200 } })
      expect(config.velocity).toBe(10)

      spring.start({ to: 200 })
      expect(config.velocity).toBe(0)
    })
    describe('when "damping" is 1.0', () => {
      it('should prevent bouncing', async () => {
        const spring = new SpringValue(0)
        spring.start(1, {
          config: { frequency: 1.5, damping: 1 },
        })
        await advanceUntilIdle()
        expect(countBounces(spring)).toBe(0)
      })
    })
    describe('when "damping" is less than 1.0', () => {
      // FIXME: This test fails.
      xit('should bounce', async () => {
        const spring = new SpringValue(0)
        spring.start(1, {
          config: { frequency: 1.5, damping: 1 },
        })
        await advanceUntilIdle()
        expect(countBounces(spring)).toBeGreaterThan(0)
      })
    })
  })
}

function describeLoopProp() {
  describe('the "loop" prop', () => {
    it('resets the animation once finished', async () => {
      const spring = new SpringValue(0)
      spring.start(1, {
        loop: true,
        config: { duration: frameLength * 3 },
      })

      await advanceUntilValue(spring, 1)
      const firstRun = getFrames(spring)
      expect(firstRun).toMatchSnapshot()

      // The loop resets the value before the next frame.
      // FIXME: Reset on next frame instead?
      expect(spring.get()).toBe(0)

      await advanceUntilValue(spring, 1)
      expect(getFrames(spring)).toEqual(firstRun)
    })

    it('can pass a custom delay', async () => {
      const spring = new SpringValue(0)
      spring.start(1, {
        loop: { reset: true, delay: 1000 },
      })

      await advanceUntilValue(spring, 1)
      expect(spring.get()).toBe(1)

      mockRaf.step({ time: 1000 })
      expect(spring.get()).toBeLessThan(1)

      await advanceUntilValue(spring, 1)
      expect(spring.get()).toBe(1)
    })

    it('supports deferred evaluation', async () => {
      const spring = new SpringValue(0)

      let loop: any = true
      spring.start(1, { loop: () => loop })

      await advanceUntilValue(spring, 1)
      expect(spring.idle).toBeFalsy()
      expect(spring.get()).toBeLessThan(1)

      loop = { reset: true, delay: 1000 }
      await advanceUntilValue(spring, 1)
      expect(spring.idle).toBeTruthy()
      expect(spring.get()).toBe(1)

      mockRaf.step({ time: 1000 })
      expect(spring.idle).toBeFalsy()
      expect(spring.get()).toBeLessThan(1)

      loop = false
      await advanceUntilValue(spring, 1)
      expect(spring.idle).toBeTruthy()
      expect(spring.get()).toBe(1)
    })

    it('does not affect later updates', async () => {
      const spring = new SpringValue(0)
      spring.start(1, { loop: true })

      await advanceUntilValue(spring, 0.5)
      spring.start(2)

      await advanceUntilValue(spring, 2)
      expect(spring.idle).toBeTruthy()
    })

    it('can be combined with the "reset" prop', async () => {
      const spring = new SpringValue(0)
      spring.start(1)

      await advanceUntilIdle()
      spring.start({ reset: true, loop: true })
      expect(spring.get()).toBe(0)

      await advanceUntilValue(spring, 1)
      expect(spring.get()).toBe(0)
      expect(spring.idle).toBeFalsy()
    })

    it('can be combined with the "reverse" prop', async () => {
      const spring = new SpringValue(0)
      spring.start(1, { config: { duration: frameLength * 3 } })

      await advanceUntilIdle()
      spring.start({
        loop: { reverse: true },
      })

      await advanceUntilValue(spring, 0)
      await advanceUntilValue(spring, 1)
      expect(getFrames(spring)).toMatchSnapshot()
    })
  })
}

function describeDelayProp() {
  describe('the "delay" prop', () => {
    // "Temporal prevention" means a delayed update can be cancelled by an
    // earlier update. This removes the need for explicit delay cancellation.
    it('allows the update to be temporally prevented', async () => {
      const spring = new SpringValue(0)
      const anim = spring.animation

      spring.start(1, { config: { duration: 1000 } })

      // This update will be ignored, because the next "start" call updates
      // the "to" prop before this update's delay is finished. This update
      // would *not* be ignored be if its "to" prop was undefined.
      spring.start(2, { delay: 500, immediate: true })

      // This update won't be affected by the previous update.
      spring.start(0, { delay: 100, config: { duration: 1000 } })

      expect(anim.to).toBe(1)
      await advanceByTime(100)
      expect(anim.to).toBe(0)

      await advanceByTime(400)
      expect(anim.immediate).toBeFalsy()
      expect(anim.to).toBe(0)
    })
  })
}

function describeEvents() {
  describe('the "onStart" event', () => {
    it('is called on the first frame', async () => {
      const onStart = jest.fn()
      const spring = new SpringValue(0, { onStart })

      spring.start(1)
      expect(onStart).toBeCalledTimes(0)

      mockRaf.step()
      expect(onStart).toBeCalledTimes(1)

      await advanceUntilIdle()
      expect(onStart).toBeCalledTimes(1)
    })
    it('is called by the "finish" method', () => {
      const onStart = jest.fn()
      const spring = new SpringValue({ from: 0, to: 1, onStart })
      expect(onStart).toBeCalledTimes(0)

      spring.finish()
      expect(onStart).toBeCalledTimes(1)
    })
  })
  describe('the "onChange" event', () => {
    it('is called on every frame', async () => {
      const onChange = jest.fn()
      const spring = new SpringValue({ from: 0, to: 1, onChange })

      await advanceUntilIdle()
      const frames = getFrames(spring)
      expect(onChange).toBeCalledTimes(frames.length)
    })
    it('receives the "to" value on the last frame', async () => {
      const onChange = jest.fn()
      const spring = new SpringValue('blue', { onChange })

      spring.start('red')
      await advanceUntilIdle()

      const [lastValue] = onChange.mock.calls.slice(-1)[0]
      expect(lastValue).toBe('red')
    })
    it('is called by the "set" method', () => {
      const onChange = jest.fn()
      const spring = new SpringValue({ from: 0, to: 1, onChange })

      mockRaf.step()
      expect(onChange).toBeCalledTimes(1)

      // During an animation:
      spring.set(1)
      expect(onChange).toBeCalledTimes(2)
      expect(spring.idle).toBeTruthy()

      // While idle:
      spring.set(0)
      expect(onChange).toBeCalledTimes(3)

      // No-op calls are ignored:
      spring.set(0)
      expect(onChange).toBeCalledTimes(3)
    })
    describe('when active handler', () => {
      it('is never called by the "set" method', () => {
        const spring = new SpringValue(0)

        const onChange = jest.fn()
        spring.start(1, { onChange })

        // Before first frame
        spring.set(2)
        expect(onChange).not.toBeCalled()

        spring.start(1, { onChange })
        mockRaf.step()
        onChange.mockReset()

        // Before last frame
        spring.set(0)
        expect(onChange).not.toBeCalled()
      })
    })
  })
  describe('the "onPause" event', () => {
    it('is called by the "pause" method', () => {
      const onPause = jest.fn()
      const spring = new SpringValue({ from: 0, to: 1, onPause })

      mockRaf.step()
      spring.pause()
      spring.pause() // noop

      expect(onPause).toBeCalledTimes(1)

      spring.resume()
      spring.pause()

      expect(onPause).toBeCalledTimes(2)
    })
  })
  describe('the "onResume" event', () => {
    it('is called by the "resume" method', () => {
      const onResume = jest.fn()
      const spring = new SpringValue({ from: 0, to: 1, onResume })

      mockRaf.step()
      spring.resume() // noop

      expect(onResume).toBeCalledTimes(0)

      spring.pause()
      spring.resume()

      expect(onResume).toBeCalledTimes(1)
    })
  })
  describe('the "onRest" event', () => {
    it('is called on the last frame', async () => {
      const onRest = jest.fn()
      // @ts-ignore
      const spring = new SpringValue({
        from: 0,
        to: 1,
        onRest,
        config: {
          // The animation is 3 frames long.
          duration: 3 * frameLength,
        },
      })

      mockRaf.step()
      mockRaf.step()
      expect(onRest).not.toBeCalled()

      mockRaf.step()
      expect(onRest).toBeCalledTimes(1)
    })
    it('is called by the "stop" method', () => {
      const onRest = jest.fn()
      const spring = new SpringValue({ from: 0, to: 1, onRest })

      mockRaf.step()
      spring.stop()

      expect(onRest).toBeCalledTimes(1)
      expect(onRest.mock.calls[0][0]).toMatchObject({
        value: spring.get(),
        finished: false,
      })
    })
    it('is called by the "finish" method', () => {
      const onRest = jest.fn()
      const spring = new SpringValue({ from: 0, to: 1, onRest })

      mockRaf.step()
      spring.finish()

      expect(onRest).toBeCalledTimes(1)
      expect(onRest.mock.calls[0][0]).toMatchObject({
        value: 1,
        finished: true,
      })
    })
    it('is called when the "cancel" prop is true', () => {
      const onRest = jest.fn()
      const spring = new SpringValue({ from: 0, to: 1, onRest })

      mockRaf.step()
      spring.start({ cancel: true })

      expect(onRest).toBeCalledTimes(1)
      expect(onRest.mock.calls[0][0]).toMatchObject({
        value: spring.get(),
        cancelled: true,
      })
    })
    it('is called after an async animation', async () => {
      const onRest = jest.fn()
      const spring = new SpringValue(0)

      await spring.start({
        to: () => {},
        onRest,
      })

      expect(onRest).toBeCalledTimes(1)
      expect(onRest.mock.calls[0][0]).toMatchObject({
        value: spring.get(),
        finished: true,
      })
    })
  })
}

function describeMethods() {
  describe('"set" method', () => {
    it('stops the active animation', async () => {
      const spring = new SpringValue(0)
      const promise = spring.start(1)

      await advanceUntilValue(spring, 0.5)
      const value = spring.get()
      spring.set(2)

      expect(spring.idle).toBeTruthy()
      expect(await promise).toMatchObject({
        finished: false,
        value,
      })
    })
  })
}

/** The minimum requirements for testing a dynamic target */
type OpaqueTarget = {
  node: FrameValue
  set: (value: number) => any
  start: (value: number) => Promise<any>
  reset: () => void
}

function describeTarget(name: string, create: (from: number) => OpaqueTarget) {
  describe('when our target is ' + name, () => {
    let target: OpaqueTarget
    let spring: SpringValue
    let observer: FluidObserver
    beforeEach(() => {
      target = create(1)
      spring = new SpringValue(0)
      // The target is not attached until the spring is observed.
      addFluidObserver(spring, (observer = () => {}))
    })

    it('animates toward the current value', async () => {
      spring.start({ to: target.node })
      expect(spring.priority).toBeGreaterThan(target.node.priority)
      expect(spring.animation).toMatchObject({
        to: target.node,
        toValues: null,
      })

      await advanceUntilIdle()
      expect(spring.get()).toBe(target.node.get())
    })

    it.todo('preserves its "onRest" prop between animations')

    it('can change its target while animating', async () => {
      spring.start({ to: target.node })
      await advanceUntilValue(spring, target.node.get() / 2)

      spring.start(0)
      expect(spring.priority).toBe(0)
      expect(spring.animation).toMatchObject({
        to: 0,
        toValues: [0],
      })

      await advanceUntilIdle()
      expect(spring.get()).toBe(0)
    })

    describe('when target is done animating', () => {
      it('keeps animating until the target is reached', async () => {
        spring.start({ to: target.node })
        target.start(1.1)

        await advanceUntil(() => target.node.idle)
        expect(spring.idle).toBeFalsy()

        await advanceUntilIdle()
        expect(spring.idle).toBeTruthy()
        expect(spring.get()).toBe(target.node.get())
      })
    })

    describe('when target animates after we go idle', () => {
      it('starts animating', async () => {
        spring.start({ to: target.node })
        await advanceUntil(() => spring.idle)
        // Clear the frame cache.
        getFrames(spring)

        target.start(2)
        await advanceUntilIdle()

        expect(getFrames(spring).length).toBeGreaterThan(1)
        expect(spring.get()).toBe(target.node.get())
      })
    })

    describe('when target has its value set (not animated)', () => {
      it('animates toward the new value', async () => {
        spring.start({ to: target.node })
        await advanceUntilIdle()

        target.set(2)
        await advanceUntilIdle()

        expect(getFrames(spring).length).toBeGreaterThan(1)
        expect(spring.get()).toBe(target.node.get())
      })
    })

    describe('when target resets its animation', () => {
      it('keeps animating', async () => {
        spring.start({ to: target.node })
        target.start(2)

        await advanceUntilValue(target.node, 1.5)
        expect(target.node.idle).toBeFalsy()

        target.reset()
        expect(target.node.get()).toBe(1)

        await advanceUntilIdle()
        const frames = getFrames(spring)

        expect(frames.length).toBeGreaterThan(1)
        expect(spring.get()).toBe(target.node.get())
      })
    })

    // In the case of an Interpolation, staying attached will prevent
    // garbage collection when an animation loop is active, which results
    // in a memory leak since the Interpolation stays in the frameloop.
    describe('when our last child is detached', () => {
      it('detaches from the target', () => {
        spring.start({ to: target.node })

        // Expect the target node to be attached.
        expect(hasFluidObserver(target.node, spring)).toBeTruthy()

        // Remove the observer.
        removeFluidObserver(spring, observer)

        // Expect the target node to be detached.
        expect(hasFluidObserver(target.node, spring)).toBeFalsy()
      })
    })
  })
}

function describeGlobals() {
  const defaults = { ...Globals }
  const resetGlobals = () => Globals.assign(defaults)
  describe('"skipAnimation" global', () => {
    afterEach(resetGlobals)
    it('still calls "onStart", "onChange", and "onRest" props', async () => {
      const spring = new SpringValue(0)

      const onStart = jest.fn()
      const onChange = jest.fn()
      const onRest = jest.fn()

      Globals.assign({ skipAnimation: true })
      await spring.start(1, { onStart, onChange, onRest })

      expect(onStart).toBeCalledTimes(1)
      expect(onChange).toBeCalledTimes(1)
      expect(onRest).toBeCalledTimes(1)
    })
  })
}

function hasFluidObserver(target: any, observer: FluidObserver) {
  const observers = getFluidObservers(target)
  return !!observers && observers.has(observer)
}
