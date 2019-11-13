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

  it('can animate toward another SpringValue', () => {
    const spring1 = new SpringValue(0)
    const spring2 = new SpringValue(1)

    spring1.start({ to: spring2 })
    expect(spring1.priority).toBeGreaterThan(spring2.priority)
    expect(spring1.animation).toMatchObject({
      to: spring2,
      toValues: null,
    })

    advanceUntilIdle()
    expect(spring1.get()).toBe(1)

    // It can switch its target to the current value.
    spring1.start(1)
    expect(spring1.priority).toBe(spring2.priority)
    expect(spring1.animation).toMatchObject({
      to: 1,
      toValues: [1],
    })
  })
})
