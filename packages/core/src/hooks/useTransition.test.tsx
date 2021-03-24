import * as React from 'react'
import { RenderResult, render } from '@testing-library/react'
import { toArray } from '@react-spring/shared'
import { TransitionFn, UseTransitionProps } from '../types'
import { useTransition } from './useTransition'
import { MessageChannel as MessageChannelPolyfill } from 'worker_threads'

beforeAll(() => {
  if (!window.MessageChannel) {
    window.MessageChannel = (MessageChannelPolyfill as unknown) as typeof window.MessageChannel
  }
})
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

    mockRaf.step()

    update(false, props)
    expect(rendered).toEqual([true, false])

    await advanceUntilIdle()
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

      mockRaf.step()

      update(false, props)
      expect(rendered).toEqual([true, false])

      await advanceUntilIdle()
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

      mockRaf.step()

      update(false, props)
      expect(rendered).toEqual([true, false])

      await advanceUntilIdle()
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

      await advanceUntilIdle()
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
      await advanceUntilIdle()

      update(false, props)
      expect(rendered).toEqual([true, false])

      await advanceUntilIdle()
      expect(rendered).toEqual([false])
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

  type Args = [any, UseTransitionProps, any[]?]
  return (...args: Args) => {
    const elem = <Component args={args} />
    if (result) result.rerender(elem)
    else result = render(elem)
    return result
  }
}
