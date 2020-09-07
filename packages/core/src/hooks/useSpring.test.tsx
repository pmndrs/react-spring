import * as React from 'react'
import { render, RenderResult } from '@testing-library/react'
import { is } from '@react-spring/shared'
import { Lookup } from '@react-spring/types'
import { SpringValue } from '../SpringValue'
import { SpringRef } from '../SpringRef'
import { useSpring } from './useSpring'

describe('useSpring', () => {
  let springs: Lookup<SpringValue>
  let ref: SpringRef

  // Call the "useSpring" hook and update local variables.
  const update = createUpdater(({ args }) => {
    const result = useSpring(...args)
    if (is.fun(args[0]) || args.length == 2) {
      springs = result[0] as any
      ref = result[1]
    } else {
      springs = result as any
      ref = undefined as any
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
    it('does not return a ref', () => {
      update({ x: 0 })
      expect(ref).toBeUndefined()
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
    it('returns a ref', () => {
      update({ x: 0 }, [1])
      expect(ref).toBeInstanceOf(SpringRef)
    })
  })

  describe('when only a props function is passed', () => {
    it('is never updated on render', () => {
      update(() => ({ x: 0 }))
      expect(springs.x.goal).toBe(0)

      update(() => ({ x: 1 }))
      expect(springs.x.goal).toBe(0)
    })
    it('returns a ref', () => {
      update(() => ({ x: 0 }))
      expect(ref).toBeInstanceOf(SpringRef)
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
    it('returns a ref', () => {
      update(() => ({ x: 0 }), [1])
      expect(ref).toBeInstanceOf(SpringRef)
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
