import * as React from 'react'
import { render } from 'vitest-browser-react'
import { is } from '@react-spring/shared'
import { Lookup } from '@react-spring/types'
import { SpringValue } from '../SpringValue'
import { useTrail, UseTrailProps } from './useTrail'

describe('useTrail', () => {
  let springs: Lookup<SpringValue>[]

  // Call the "useSprings" hook and update local variables.
  const update = createUpdater(({ args }) => {
    const result = useTrail(...args)
    // @ts-expect-error - TODO: fix this type error.
    springs = is.arr(result[0]) ? result[0] : result
    return null
  })

  it('has each spring follow the spring before it', async () => {
    await update(2, { x: 100, from: { x: 0 } })
    expect(springs.length).toBe(2)
    expect(springs[1].x.animation.to).toBe(springs[0].x)

    global.mockRaf.step()
    expect(springs[0].x.get()).not.toBe(springs[1].x.get())
  })

  describe('when a props object is passed', () => {
    it('updates every spring on rerender', async () => {
      const props = { opacity: 1, config: { tension: 100 } }
      await update(2, props)

      const configs = springs.map(s => s.opacity.animation.config)
      expect(configs.every(config => config.tension == 100)).toBeTruthy()

      props.config.tension = 50
      await update(2, props)

      expect(configs.every(config => config.tension == 50)).toBeTruthy()
    })
  })

  describe('when a props function is passed', () => {
    it('does nothing on rerender', async () => {
      const propsFn = vi.fn((_i: number) => ({ x: 100 }))
      await update(2, propsFn)
      propsFn.mockClear()
      await update(2, propsFn)
      expect(propsFn).not.toBeCalled()
    })
  })

  describe('with the "reverse" prop', () => {
    describe('when "reverse" becomes true', () => {
      it('swaps the "to" and "from" props', async () => {
        await update(2, { x: 100, from: { x: 0 } })
        await update(2, { x: 100, from: { x: 0 }, reverse: true })
        // The head with reverse:true is the last spring, with to/from swapped.
        expect(springs[1].x.animation.to).toBe(0)
        expect(springs[1].x.animation.from).toBe(100)
      })

      it('has each spring follow the spring after it', async () => {
        await update(2, { x: 100, from: { x: 0 } })
        await update(2, { x: 100, from: { x: 0 }, reverse: true })
        expect(springs[0].x.animation.to).toBe(springs[1].x)
      })
    })
    describe('when "reverse" becomes false', () => {
      it('uses the "to" and "from" props as-is', async () => {
        await update(2, { x: 100, from: { x: 0 }, reverse: true })
        await update(2, { x: 100, from: { x: 0 }, reverse: false })
        // The head with reverse:false is springs[0], with to/from as passed.
        expect(springs[0].x.animation.to).toBe(100)
        expect(springs[0].x.animation.from).toBe(0)
      })

      it('has each spring follow the spring before it', async () => {
        await update(2, { x: 100, from: { x: 0 }, reverse: true })
        await update(2, { x: 100, from: { x: 0 }, reverse: false })
        expect(springs[1].x.animation.to).toBe(springs[0].x)
      })
    })
  })

  // Issue #1063: with `loop: true`, every parent change re-enters the child's
  // `_start` → `AnimatedValue.reset()`, zeroing its progress each frame. Each
  // child acts as a low-pass filter on its parent, so under looping, deeper
  // children trap in a narrowing band near the mid-range and never sweep the
  // full from→to distance. The fix subscribes every non-head child to the
  // head's loop restarts so they snap back to `from` in phase.
  describe('with the "loop" prop (issue #1063)', () => {
    it('phase-syncs every spring on each loop iteration', async () => {
      const length = 4
      await update(length, { from: { x: 0 }, to: { x: 100 }, loop: true })

      expect(springs.length).toBe(length)

      // Warm up past the first cycle so steady-state behaviour dominates the
      // sample. Default physics (tension 170, friction 26) settles in ~80
      // frames per head loop; 300 frames covers ~3 head cycles.
      await global.advance(300)

      // Drain warm-up frames so the next window measures only steady state.
      springs.forEach(s => global.getFrames(s.x))

      // Sample long enough to cover multiple head loops.
      await global.advance(300)

      springs.forEach((s, i) => {
        const frames = global.getFrames(s.x)
        expect(
          frames.length,
          `spring[${i}] produced no frames in the sample window`
        ).toBeGreaterThan(0)
        const min = Math.min(...(frames as number[]))
        // Every spring should return close to `from` (0) on every iteration.
        // Without the phase-sync, deeper children trap above ~50 and never
        // approach 0 (e.g. spring[3] sits ~70 in steady state).
        expect(min, `spring[${i}] min over window: ${min}`).toBeLessThan(20)
      })
    })
  })
})

function createUpdater(
  Component: React.ComponentType<{ args: [any, any, any?] }>
) {
  let result: Awaited<ReturnType<typeof render>> | undefined
  afterEach(() => {
    result = undefined
  })

  type Args = [number, UseTrailProps, any[]?]
  return async (...args: Args) => {
    const elem = <Component args={args} />
    if (result) await result.rerender(elem)
    else result = await render(elem)
    return result
  }
}
