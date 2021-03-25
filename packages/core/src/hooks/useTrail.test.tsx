import * as React from 'react'
import { render, RenderResult } from '@testing-library/react'
import { is } from '@react-spring/shared'
import { Lookup } from '@react-spring/types'
import { SpringValue } from '../SpringValue'
import { useTrail, UseTrailProps } from './useTrail'

describe('useTrail', () => {
  let springs: Lookup<SpringValue>[]

  // Call the "useSprings" hook and update local variables.
  const update = createUpdater(({ args }) => {
    const result = useTrail(...args)
    springs = is.arr(result[0]) ? result[0] : result
    return null
  })

  it('has each spring follow the spring before it', () => {
    update(2, { x: 100, from: { x: 0 } })
    expect(springs.length).toBe(2)
    expect(springs[1].x.animation.to).toBe(springs[0].x)

    global.mockRaf.step()
    expect(springs[0].x.get()).not.toBe(springs[1].x.get())
  })

  describe('when a props object is passed', () => {
    it('updates every spring on rerender', () => {
      const props = { opacity: 1, config: { tension: 100 } }
      update(2, props)

      const configs = springs.map(s => s.opacity.animation.config)
      expect(configs.every(config => config.tension == 100)).toBeTruthy()

      props.config.tension = 50
      update(2, props)

      expect(configs.every(config => config.tension == 50)).toBeTruthy()
    })
  })

  describe('when a props function is passed', () => {
    it.todo('does nothing on rerender')
  })

  describe('with the "reverse" prop', () => {
    describe('when "reverse" becomes true', () => {
      it.todo('swaps the "to" and "from" props')
      it.todo('has each spring follow the spring after it')
    })
    describe('when "reverse" becomes false', () => {
      it.todo('uses the "to" and "from" props as-is')
      it.todo('has each spring follow the spring before it')
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

  type Args = [number, UseTrailProps, any[]?]
  return (...args: Args) => {
    const elem = <Component args={args} />
    if (result) result.rerender(elem)
    else result = render(elem)
    return result
  }
}
