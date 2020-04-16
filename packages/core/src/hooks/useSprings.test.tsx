import React from 'react'
import { render, RenderResult } from '@testing-library/react'
import { useSprings } from './useSprings'
import { is, each, Lookup } from 'shared'
import { SpringStopFn, SpringStartFn } from '../types'
import { SpringValue } from '../SpringValue'

describe('useSprings', () => {
  let springs: Lookup<SpringValue>[]
  let animate: SpringStartFn<any>
  let stop: SpringStopFn<any>

  // Call the "useSprings" hook and update local variables.
  const update = createUpdater(({ args }) => {
    const result = useSprings(...args)
    if (is.fun(args[1]) || args.length == 3) {
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

  describe('when only a props function is passed', () => {
    it('calls the props function once per new spring', () => {
      const getProps = jest.fn((i: number) => ({ x: i * 100 }))

      // Create two springs.
      update(2, getProps)
      expect(getProps).toHaveBeenCalledTimes(2)
      expect(springs.length).toBe(2)

      // Do nothing.
      update(2, getProps)
      expect(getProps).toHaveBeenCalledTimes(2)
      expect(springs.length).toBe(2)

      // Create a spring.
      update(3, getProps)
      expect(getProps).toHaveBeenCalledTimes(3)
      expect(springs.length).toBe(3)

      // Remove a spring.
      update(2, getProps)
      expect(getProps).toHaveBeenCalledTimes(3)
      expect(springs.length).toBe(2)

      // Create two springs.
      update(4, getProps)
      expect(getProps).toHaveBeenCalledTimes(5)
      expect(springs.length).toBe(4)
    })
  })

  describe('when both a props function and a deps array are passed', () => {
    it('updates each spring when the deps have changed', () => {
      const getProps = jest.fn((i: number) => ({ x: i * 100 }))

      update(2, getProps, [1])
      expect(getProps).toHaveBeenCalledTimes(2)

      update(2, getProps, [1])
      expect(getProps).toHaveBeenCalledTimes(2)

      update(2, getProps, [2])
      expect(getProps).toHaveBeenCalledTimes(4)
    })
  })

  describe('when only a props array is passed', () => {
    it('updates each spring on every render', () => {
      update(2, [{ x: 0 }, { x: 0 }])
      expect(mapSprings(s => s.goal)).toEqual([{ x: 0 }, { x: 0 }])

      update(3, [{ x: 1 }, { x: 2 }, { x: 3 }])
      expect(mapSprings(s => s.goal)).toEqual([{ x: 1 }, { x: 2 }, { x: 3 }])
    })
  })

  describe('when the length argument increases', () => {
    it('creates new springs', () => {
      const getProps = (i: number) => ({ x: i * 100 })

      update(0, getProps)
      expect(springs.length).toBe(0)

      update(2, getProps)
      expect(springs.length).toBe(2)
    })
  })

  describe('when the length argument decreases', () => {
    it('removes old springs', () => {
      const getProps = (i: number) => ({ x: i * 100 })

      update(3, getProps)
      expect(springs.length).toBe(3)

      update(1, getProps)
      expect(springs.length).toBe(1)
    })
  })

  function mapSprings<T>(fn: (spring: SpringValue) => T) {
    return springs.map(values => {
      const result: any = {}
      each(values, spring => {
        result[spring.key!] = fn(spring)
      })
      return result
    })
  }
})

function createUpdater(
  Component: React.ComponentType<{ args: [any, any, any?] }>
) {
  let result: RenderResult | undefined
  afterEach(() => {
    result = undefined
  })

  type Args = [number, any[] | ((i: number) => any), any[]?]
  return (...args: Args) => {
    const elem = <Component args={args} />
    if (result) result.rerender(elem)
    else result = render(elem)
    return result
  }
}
