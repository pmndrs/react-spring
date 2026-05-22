import * as React from 'react'
import { render } from 'vitest-browser-react'
import { is, eachProp } from '@react-spring/shared'
import { Lookup } from '@react-spring/types'
import { SpringRef } from '../SpringRef'
import { SpringValue } from '../SpringValue'
import { useSprings } from './useSprings'

describe('useSprings', () => {
  // StrictMode is enabled globally via configure() in test/setup.ts, so
  // props functions are invoked twice per render.
  const strictModeFunctionCallMultiplier = 2
  let springs: Lookup<SpringValue>[]
  let ref: SpringRef

  // Call the "useSprings" hook and update local variables.
  const update = createUpdater(({ args }) => {
    const result = useSprings(...args)
    if (is.fun(args[1]) || args.length == 3) {
      springs = result[0] as any
      ref = result[1]
    } else {
      springs = result as any
      ref = undefined as any
    }
    return null
  })

  describe('when only a props function is passed', () => {
    it('should reach final value in strict mode', async () => {
      await update(1, () => ({
        from: { x: 0 },
        to: { x: 1 },
      }))
      expect(mapSprings(s => s.goal)).toEqual([{ x: 1 }])
    })

    it('calls the props function once per new spring', async () => {
      const getProps = vi.fn((i: number) => ({ x: i * 100 }))

      // Create two springs.
      await update(2, getProps)
      expect(getProps).toHaveBeenCalledTimes(
        2 * strictModeFunctionCallMultiplier
      )
      expect(springs.length).toBe(2)
      expect(ref.current.length).toBe(2)

      // Do nothing.
      await update(2, getProps)
      expect(getProps).toHaveBeenCalledTimes(
        2 * strictModeFunctionCallMultiplier
      )
      expect(springs.length).toBe(2)
      expect(ref.current.length).toBe(2)

      // Create a spring.
      await update(3, getProps)
      expect(getProps).toHaveBeenCalledTimes(
        3 * strictModeFunctionCallMultiplier
      )
      expect(springs.length).toBe(3)
      expect(ref.current.length).toBe(3)

      // Remove a spring.
      await update(2, getProps)
      expect(getProps).toHaveBeenCalledTimes(
        3 * strictModeFunctionCallMultiplier
      )
      expect(springs.length).toBe(2)
      expect(ref.current.length).toBe(2)

      // Create two springs.
      await update(4, getProps)
      expect(getProps).toHaveBeenCalledTimes(
        5 * strictModeFunctionCallMultiplier
      )
      expect(springs.length).toBe(4)
      expect(ref.current.length).toBe(4)
    })

    it('imperative start is not overridden by stale declarative updates on re-render', async () => {
      // Regression for #2376 / #2377: declarative initial values via props fn
      // are stored in a ref during render and applied in the layout effect. If
      // the ref is not cleared after applying, every subsequent re-render's
      // layout effect re-applies them, clobbering imperative `ref.start(...)`
      // targets and resetting the goal back to the initial value.
      await update(1, () => ({ x: 0 }))

      ref.start({ x: 1 })
      expect(mapSprings(s => s.goal)).toEqual([{ x: 1 }])

      // Re-render — props fn unchanged, no new declarative updates expected.
      await update(1, () => ({ x: 0 }))
      expect(mapSprings(s => s.goal)).toEqual([{ x: 1 }])
    })
  })

  describe('when both a props function and a deps array are passed', () => {
    it('updates each spring when the deps have changed', async () => {
      const getProps = vi.fn((i: number) => ({ x: i * 100 }))

      await update(2, getProps, [1])
      expect(getProps).toHaveBeenCalledTimes(
        2 * strictModeFunctionCallMultiplier
      )

      await update(2, getProps, [1])
      expect(getProps).toHaveBeenCalledTimes(
        2 * strictModeFunctionCallMultiplier
      )

      await update(2, getProps, [2])
      expect(getProps).toHaveBeenCalledTimes(
        4 * strictModeFunctionCallMultiplier
      )
    })
  })

  describe('when only a props array is passed', () => {
    it('updates each spring on every render', async () => {
      await update(2, [{ x: 0 }, { x: 0 }])
      expect(mapSprings(s => s.goal)).toEqual([{ x: 0 }, { x: 0 }])

      await update(3, [{ x: 1 }, { x: 2 }, { x: 3 }])
      expect(mapSprings(s => s.goal)).toEqual([{ x: 1 }, { x: 2 }, { x: 3 }])
    })
  })

  describe('when the length argument increases', () => {
    it('creates new springs', async () => {
      const getProps = (i: number) => ({ x: i * 100 })

      await update(0, getProps, [[]])
      expect(springs.length).toBe(0)
      expect(ref.current.length).toBe(0)

      await update(2, getProps, [[1, 2]])
      expect(springs.length).toBe(2)
      expect(ref.current.length).toBe(2)

      await update(0, getProps, [[]])
      expect(springs.length).toBe(0)
      expect(ref.current.length).toBe(0)

      await update(2, getProps, [[1, 2]])
      expect(springs.length).toBe(2)
      expect(ref.current.length).toBe(2)

      await update(1, getProps, [[1]])
      expect(springs.length).toBe(1)
      expect(ref.current.length).toBe(1)

      await update(2, getProps, [[1, 2]])
      expect(springs.length).toBe(2)
      expect(ref.current.length).toBe(2)
    })
  })

  describe('when the length argument decreases', () => {
    it('removes old springs', async () => {
      const getProps = (i: number) => ({ x: i * 100 })

      await update(3, getProps)
      expect(springs.length).toBe(3)
      expect(ref.current.length).toBe(3)

      await update(1, getProps)
      expect(springs.length).toBe(1)
      expect(ref.current.length).toBe(1)

      await update(3, getProps)
      expect(springs.length).toBe(3)
      expect(ref.current.length).toBe(3)

      await update(1, getProps)
      expect(springs.length).toBe(1)
      expect(ref.current.length).toBe(1)
    })
  })

  function mapSprings<T>(fn: (spring: SpringValue) => T) {
    return springs.map(values => {
      const result: any = {}
      eachProp(values, spring => {
        result[spring.key!] = fn(spring)
      })
      return result
    })
  }
})

function createUpdater(
  Component: React.ComponentType<{ args: [any, any, any?] }>
) {
  let result: Awaited<ReturnType<typeof render>> | undefined
  afterEach(() => {
    result = undefined
  })

  type Args = [number, any[] | ((i: number) => any), any[]?]
  return async (...args: Args) => {
    const elem = <Component args={args} />
    if (result) await result.rerender(elem)
    else result = await render(elem)
    return result
  }
}
