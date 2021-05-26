import * as React from 'react'
import '@testing-library/jest-dom'
import { RenderResult, render } from '@testing-library/react'
import { toArray } from '@react-spring/shared'
import { TransitionFn, UseTransitionProps } from '../types'
import { useTransition } from './useTransition'
import { SpringRef } from '../SpringRef'

describe('useTransition', () => {
  let transition: TransitionFn
  let rendered: any[]

  // Call the "useTransition" hook and update local variables.
  const update = createUpdater(({ args }) => {
    transition = toArray(useTransition(...args))[0]
    rendered = transition((_, item) => item).props.children
    return null
  })

  it('unmounts after leave', async () => {
    const props = {
      from: { n: 0 },
      enter: { n: 1 },
      leave: { n: 0 },
    }

    update(true, props)
    expect(rendered).toEqual([true])

    global.mockRaf.step()

    update(false, props)
    expect(rendered).toEqual([true, false])

    await global.advanceUntilIdle()
    expect(rendered).toEqual([false])
  })

  describe('when "leave" is an array', () => {
    it('unmounts after leave', async () => {
      const props = {
        from: { n: 0 },
        enter: { n: 1 },
        leave: [{ n: 0 }],
      }

      update(true, props)
      expect(rendered).toEqual([true])

      global.mockRaf.step()

      update(false, props)
      expect(rendered).toEqual([true, false])

      await global.advanceUntilIdle()
      expect(rendered).toEqual([false])
    })
  })

  describe('when "leave" is a function', () => {
    it('unmounts after leave', async () => {
      const props: UseTransitionProps = {
        from: { n: 0 },
        enter: { n: 1 },
        leave: () => async next => {
          await next({ n: 0 })
        },
      }

      update(true, props)
      expect(rendered).toEqual([true])

      global.mockRaf.step()

      update(false, props)
      expect(rendered).toEqual([true, false])

      await global.advanceUntilIdle()
      expect(rendered).toEqual([false])
    })
  })

  describe('when "enter" is a function', () => {
    it('still has its "onRest" prop called', async () => {
      const onRest = jest.fn()
      update(true, {
        from: { x: 0 },
        enter: () => ({
          x: 1,
          onRest,
        }),
      })

      await global.advanceUntilIdle()
      expect(onRest).toBeCalledTimes(1)
    })
  })

  describe('when "leave" is a no-op update', () => {
    it('still unmounts the transition', async () => {
      const props = {
        from: { t: 0 },
        enter: { t: 1 },
        leave: { t: 1 },
      }

      update(true, props)
      expect(rendered).toEqual([true])
      await global.advanceUntilIdle()

      update(false, props)
      expect(rendered).toEqual([true, false])

      await global.advanceUntilIdle()
      expect(rendered).toEqual([false])
    })
  })

  it('assign controllers to provided "ref"', async () => {
    const ref = SpringRef()
    const props = {
      ref,
    }
    const children = [<div />, <div />, <div />]

    update(children, props)

    expect(ref.current).toHaveLength(3)

    testIsRef(ref)
  })

  it('returns a ref if the props argument is a function', () => {
    let transRef: SpringRef | null = null
    const update = createUpdater(({ args }) => {
      const [transition, ref] = useTransition(...args)
      rendered = transition((_, item) => item).props.children
      transRef = ref
      return null
    })

    update(true, () => ({
      from: { n: 0 },
      enter: { n: 1 },
      leave: { n: 0 },
    }))

    expect(rendered).toEqual([true])

    testIsRef(transRef)
  })
})

function createUpdater(
  Component: React.ComponentType<{ args: [any, any, any?] }>
) {
  let result: RenderResult | undefined
  afterEach(() => {
    result = undefined
  })

  type Args = [any, UseTransitionProps | (() => UseTransitionProps), any[]?]
  return (...args: Args) => {
    const elem = <Component args={args} />
    if (result) result.rerender(elem)
    else result = render(elem)
    return result
  }
}

function testIsRef(ref: SpringRef | null) {
  const props = [
    'add',
    'delete',
    'pause',
    'resume',
    'set',
    'start',
    'stop',
    'update',
    '_getProps',
  ]
  props.forEach(prop => expect(ref).toHaveProperty(prop))
}
