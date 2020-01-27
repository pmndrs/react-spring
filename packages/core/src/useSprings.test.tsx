import React from 'react'
import { Controller } from './Controller'
import { render, RenderResult } from '@testing-library/react'
import { useSprings } from './useSprings'
import { is } from 'shared'
import { SpringsUpdateFn, SpringStopFn } from './types/spring'

describe('useSprings', () => {
  let springs: Controller[]
  let animate: SpringsUpdateFn<any>
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

  describe('when the length argument increases', () => {
    it('creates new spring objects', () => {
      const getProps = (i: number) => ({ x: i * 100 })
      update(0, getProps)
      expect(springs.length).toBe(0)
      update(2, getProps)
      expect(springs.length).toBe(2)
    })
  })

  describe('when the length argument decreases', () => {
    it('removes excess spring objects', () => {
      const getProps = (i: number) => ({ x: i * 100 })
      update(3, getProps)
      expect(springs.length).toBe(3)
      update(1, getProps)
      expect(springs.length).toBe(1)
    })
  })
})

function createUpdater(
  Component: React.ComponentType<{ args: [any, any, any?] }>
) {
  let result: RenderResult | undefined
  afterEach(() => {
    result = undefined
  })

  return (...args: Parameters<typeof useSprings>) => {
    const elem = <Component args={args} />
    if (result) result.rerender(elem)
    else result = render(elem)
    return result
  }
}
