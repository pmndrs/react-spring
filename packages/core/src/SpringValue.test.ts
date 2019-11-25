import { SpringValue } from './SpringValue'

const frameLength = 1000 / 60

describe('SpringValue', () => {
  it('can animate from 0 to 1 with linear easing', () => {
    const spring = new SpringValue(0)
    spring.start(1, {
      config: { duration: 10 * frameLength },
    })
    const frames = getFrames(spring)
    expect(frames).toMatchSnapshot()
  })

  describe('"set" method', () => {
    it('stops the active animation', async () => {
      const spring = new SpringValue(0)
      const promise = spring.start(1)

      advanceUntilValue(spring, 0.5)
      spring.set(2)

      expect(spring.idle).toBeTruthy()
      expect(await promise).toMatchObject({
        finished: false,
        value: 2,
      })
    })

    describe('when a new value is passed', () => {
      it('calls the "onChange" prop', () => {
        const onChange = jest.fn()
        const spring = new SpringValue(0, { onChange })
        spring.set(1)
        expect(onChange).toBeCalledWith(1, spring)
      })
      it.todo('wraps the "onChange" call with "batchedUpdates"')
    })

    describe('when the current value is passed', () => {
      it('skips the "onChange" call', () => {
        const onChange = jest.fn()
        const spring = new SpringValue(0, { onChange })
        spring.set(0)
        expect(onChange).not.toBeCalled()
      })
    })
  })

  describe('when our target is another SpringValue', () => {
    it('animates toward the current value', () => {
      const spring = new SpringValue(0)
      const target = new SpringValue(1)

      spring.start({ to: target })
      expect(spring.priority).toBeGreaterThan(target.priority)
      expect(spring.animation).toMatchObject({
        to: target,
        toValues: null,
      })

      advanceUntilIdle()
      expect(spring.get()).toBe(1)
    })

    it('can change its target while animating', () => {
      const spring = new SpringValue(0)
      const target = new SpringValue(1)

      spring.start({ to: target })
      advanceUntilValue(spring, 0.5)

      spring.start(0)
      expect(spring.priority).toBe(target.priority)
      expect(spring.animation).toMatchObject({
        to: 0,
        toValues: [0],
      })

      advanceUntilIdle()
      expect(spring.get()).toBe(0)
    })

    describe('when target is done animating', () => {
      it('keeps animating until the target is reached', () => {
        const spring = new SpringValue(0)
        const target = new SpringValue(1)

        spring.start({ to: target })
        target.start({ to: 1.1 })

        advanceUntil(() => target.idle)
        expect(spring.idle).toBeFalsy()

        advanceUntilIdle()
        expect(spring.idle).toBeTruthy()
        expect(spring.get()).toBe(1.1)
      })
    })

    describe('when target animates after we go idle', () => {
      it('starts animating', () => {
        const spring = new SpringValue(0)
        const target = new SpringValue(1)

        spring.start({ to: target })
        advanceUntil(() => spring.idle)

        target.start({ to: 2 })
        expect(getFrames(spring).length).toBeGreaterThan(1)
        expect(spring.get()).toBe(2)
      })
    })

    describe('when target has its value set (not animated)', () => {
      it('animates toward the new value', () => {
        const spring = new SpringValue(0)
        const target = new SpringValue(1)

        spring.start({ to: target })
        advanceUntilIdle()

        target.set(2)
        expect(getFrames(spring).length).toBeGreaterThan(1)
        expect(spring.get()).toBe(2)
      })
    })
  })
})
