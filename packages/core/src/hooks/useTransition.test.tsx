import * as React from 'react'
import { render } from 'vitest-browser-react'
import { toArray } from '@react-spring/shared'
import { TransitionFn, UseTransitionProps } from '../types'
import { useTransition } from './useTransition'
import { SpringRef } from '../SpringRef'

describe('useTransition', () => {
  let transition: TransitionFn
  let rendered: any[]

  afterEach(() => {
    result = undefined
  })

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

    await update(true, props)
    expect(rendered).toEqual([true])

    global.mockRaf.step()

    await update(false, props)
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

      await update(true, props)
      expect(rendered).toEqual([true])

      global.mockRaf.step()

      await update(false, props)
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

      await update(true, props)
      expect(rendered).toEqual([true])

      global.mockRaf.step()

      await update(false, props)
      expect(rendered).toEqual([true, false])

      await global.advanceUntilIdle()
      expect(rendered).toEqual([false])
    })
  })

  describe('when "enter" is a function', () => {
    it('still has its "onRest" prop called', async () => {
      const onRest = vi.fn()
      await update(true, {
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

      await update(true, props)
      expect(rendered).toEqual([true])
      await global.advanceUntilIdle()

      await update(false, props)
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
    const children = [<div key={1} />, <div key={2} />, <div key={3} />]

    await update(children, props)

    expect(ref.current).toHaveLength(3)

    testIsRef(ref)
  })

  it('returns a ref if the props argument is a function', async () => {
    let transRef: SpringRef | null = null
    const update = createUpdater(({ args }) => {
      const [transition, ref] = useTransition(...args)
      rendered = transition((_, item) => item).props.children
      transRef = ref
      return null
    })

    await update(true, () => ({
      from: { n: 0 },
      enter: { n: 1 },
      leave: { n: 0 },
    }))

    expect(rendered).toEqual([true])

    testIsRef(transRef)
  })

  it('passes immediate through to payload', async () => {
    const props = {
      from: { n: 0 },
      enter: { n: 1 },
      leave: { n: 0 },
      immediate: true,
    }

    await update(true, props)

    transition(style => {
      expect(style.n.animation.immediate).toEqual(true)

      return null
    })
  })

  it('should allow items to leave before entering new items when exitBeforeEnter is true', async () => {
    const props = {
      from: { t: 0 },
      enter: { t: 1 },
      leave: { t: 1 },
      exitBeforeEnter: true,
    }

    await update(0, props)

    expect(rendered).toEqual([0])

    global.mockRaf.step()

    await update(1, props)

    global.mockRaf.step()

    expect(rendered).toEqual([0])

    await global.advanceUntilIdle()

    expect(rendered).toEqual([1])
  })

  it('exposes phase === "leave" to the render fn during a normal leave', async () => {
    // Regression test for https://github.com/pmndrs/react-spring/issues/1654
    // The render function receives the transition state `t` as its third
    // argument; consumers read `t.phase` to branch on lifecycle.
    const phaseLog: string[] = []
    const update = createUpdater(({ args }) => {
      const t = toArray(useTransition(...args))[0] as TransitionFn
      rendered = t((_, item, state) => {
        phaseLog.push(`${item}:${state.phase}`)
        return item
      }).props.children
      return null
    })

    const props = {
      from: { n: 0 },
      enter: { n: 1 },
      leave: { n: 0 },
    }

    await update(true, props)
    await global.advanceUntilIdle()

    phaseLog.length = 0
    await update(false, props)
    await global.advanceUntilIdle()

    expect(phaseLog.some(entry => entry.endsWith(':leave'))).toBe(true)
  })

  it('should work with both exitBeforeEnter and trail together', async () => {
    const props = {
      from: { t: 0 },
      enter: { t: 1 },
      leave: { t: 0 },
      exitBeforeEnter: true,
      trail: 100,
    }

    // Start with two items
    await update([0, 1], props)
    expect(rendered).toEqual([0, 1])

    global.mockRaf.step()

    // Replace with two new items - the old ones should leave first with trail
    await update([2, 3], props)

    global.mockRaf.step()

    // Old items should still be visible (leaving with trail)
    expect(rendered).toEqual([0, 1])

    // Wait for all leave animations to complete
    await global.advanceUntilIdle()

    // New items should now be visible
    expect(rendered).toEqual([2, 3])
  })

  describe('when "reverse" is true', () => {
    // Regression for https://github.com/pmndrs/react-spring/issues/1794 —
    // reverses the trail order so items can animate in forward on enter
    // and backward on leave by toggling `reverse` with caller state.
    it('reverses the trail order across leaving items', async () => {
      const leaveStart: number[] = []
      const props: UseTransitionProps<number> = {
        from: { n: 0 },
        enter: { n: 1 },
        leave: item => ({
          n: 0,
          onStart: () => leaveStart.push(item),
        }),
        trail: 100,
        reverse: true,
      }

      await update([0, 1, 2], props)
      await global.advanceUntilIdle()

      await update([], props)

      global.mockRaf.step()
      expect(leaveStart).toEqual([2])

      await global.advanceByTime(100)
      expect(leaveStart).toEqual([2, 1])

      await global.advanceByTime(100)
      expect(leaveStart).toEqual([2, 1, 0])
    })

    it('keeps trail order forward when reverse is false (default)', async () => {
      const leaveStart: number[] = []
      const props: UseTransitionProps<number> = {
        from: { n: 0 },
        enter: { n: 1 },
        leave: item => ({
          n: 0,
          onStart: () => leaveStart.push(item),
        }),
        trail: 100,
      }

      await update([0, 1, 2], props)
      await global.advanceUntilIdle()

      await update([], props)

      global.mockRaf.step()
      expect(leaveStart).toEqual([0])

      await global.advanceByTime(100)
      expect(leaveStart).toEqual([0, 1])

      await global.advanceByTime(100)
      expect(leaveStart).toEqual([0, 1, 2])
    })
  })
})

let result: Awaited<ReturnType<typeof render>> | undefined
function createUpdater(
  Component: React.ComponentType<{ args: [any, any, any?] }>
) {
  type Args = [any, UseTransitionProps | (() => UseTransitionProps), any[]?]
  return async (...args: Args) => {
    const elem = <Component args={args} />
    if (result) await result.rerender(elem)
    else result = await render(elem)
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
