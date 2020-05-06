import * as React from 'react'
import { render, RenderResult } from '@testing-library/react'
import { useSpring } from './useSpring'
import { is, Lookup, UnknownProps } from 'shared'
import { SpringStopFn, SpringStartFn } from '../types'
import { SpringValue } from '../SpringValue'

describe('useSpring', () => {
  let springs: Lookup<SpringValue>
  let animate: SpringStartFn<UnknownProps>
  let stop: SpringStopFn<any>

  // Call the "useSpring" hook and update local variables.
  const update = createUpdater(({ args }) => {
    const result = useSpring(...args)
    if (is.fun(args[0]) || args.length == 2) {
      springs = result[0] as any
      animate = result[1]
      stop = result[2]
    } else {
      springs = result as any
      animate = stop = () => {
        throw Error('Function does not exist')
      }
    }
    return null
  })

  describe('when only a props object is passed', () => {
    it('is updated every render', () => {
      update({ x: 0 })
      expect(springs.x.goal).toBe(0)

      update({ x: 1 })
      expect(springs.x.goal).toBe(1)
    })
    it('returns only the animated values', () => {
      expect(() => animate({ x: 2 })).toThrowError()
      expect(() => stop()).toThrowError()
    })
  })

  describe('when both a props object and a deps array are passed', () => {
    it('is updated only when a dependency changes', () => {
      update({ x: 0 }, [1])
      expect(springs.x.goal).toBe(0)

      update({ x: 1 }, [1])
      expect(springs.x.goal).toBe(0)

      update({ x: 1 }, [2])
      expect(springs.x.goal).toBe(1)
    })
    it('returns the "animate" and "stop" functions', () => {
      update({ x: 0 }, [])
      expect(springs.x.goal).toBe(0)

      animate({ x: 1 })
      expect(springs.x.goal).toBe(1)
      expect(springs.x.idle).toBeFalsy()

      stop()
      expect(springs.x.idle).toBeTruthy()
    })
  })

  describe('when only a props function is passed', () => {
    it('is never updated on render', () => {
      update(() => ({ x: 0 }))
      expect(springs.x.goal).toBe(0)

      update(() => ({ x: 1 }))
      expect(springs.x.goal).toBe(0)
    })
    it('returns the "animate" and "stop" functions', () => {
      update(() => ({ x: 0 }))
      expect(springs.x.goal).toBe(0)

      animate({ x: 1 })
      expect(springs.x.goal).toBe(1)
      expect(springs.x.idle).toBeFalsy()

      stop()
      expect(springs.x.idle).toBeTruthy()
    })
  })

  describe('when both a props function and a deps array are passed', () => {
    it('is updated when a dependency changes', () => {
      update(() => ({ x: 0 }), [1])
      expect(springs.x.goal).toBe(0)

      update(() => ({ x: 1 }), [1])
      expect(springs.x.goal).toBe(0)

      update(() => ({ x: 1 }), [2])
      expect(springs.x.goal).toBe(1)
    })
    it('returns the "animate" and "stop" functions', () => {
      update(() => ({ x: 0 }), [])
      expect(springs.x.goal).toBe(0)

      animate({ x: 1 })
      expect(springs.x.goal).toBe(1)
      expect(springs.x.idle).toBeFalsy()

      stop()
      expect(springs.x.idle).toBeTruthy()
    })
  })
})

function createUpdater(Component: React.ComponentType<{ args: [any, any?] }>) {
  let result: RenderResult | undefined
  afterEach(() => {
    result = undefined
  })

  type Args = Parameters<typeof useSpring>
  return (...args: [Args[0], Args[1]?]) => {
    const elem = <Component args={args} />
    if (result) result.rerender(elem)
    else result = render(elem)
    return result
  }
}
