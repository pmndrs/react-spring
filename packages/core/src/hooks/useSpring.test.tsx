import * as React from 'react'
import { render, RenderResult } from '@testing-library/react'
import { is } from '@react-spring/shared'
import { Lookup } from '@react-spring/types'
import { SpringContext } from '../SpringContext'
import { SpringValue } from '../SpringValue'
import { SpringRef } from '../SpringRef'
import { useSpring } from './useSpring'

describe('useSpring', () => {
  let springs: Lookup<SpringValue>
  let ref: SpringRef

  // Call the "useSpring" hook and update local variables.
  const [update, context] = createUpdater(({ args }) => {
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

    describe('when SpringContext has "pause={false}"', () => {
      it('stays paused if last rendered with "pause: true"', () => {
        const props = { from: { t: 0 }, to: { t: 1 } }

        // Paused by context.
        context.set({ pause: true })
        update({ ...props, pause: false })
        expect(springs.t.isPaused).toBeTruthy()

        // Paused by props and context.
        update({ ...props, pause: true })
        expect(springs.t.isPaused).toBeTruthy()

        // Paused by props.
        context.set({ pause: false })
        expect(springs.t.isPaused).toBeTruthy()

        // Resumed.
        update({ ...props, pause: false })
        expect(springs.t.isPaused).toBeFalsy()
      })
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
      testIsRef(ref)
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
      testIsRef(ref)
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
      testIsRef(ref)
    })
  })
})

interface TestContext extends SpringContext {
  set(values: SpringContext): void
}

function createUpdater(Component: React.ComponentType<{ args: [any, any?] }>) {
  let prevElem: JSX.Element | undefined
  let result: RenderResult | undefined

  const context: TestContext = {
    set(values) {
      Object.assign(this, values)
      if (prevElem) {
        renderWithContext(prevElem)
      }
    },
  }
  // Ensure `context.set` is ignored.
  Object.defineProperty(context, 'set', {
    value: context.set,
    enumerable: false,
  })

  afterEach(() => {
    result = prevElem = undefined
    for (const key in context) {
      delete (context as any)[key]
    }
  })

  function renderWithContext(elem: JSX.Element) {
    const wrapped = <SpringContext {...context}>{elem}</SpringContext>
    if (result) result.rerender(wrapped)
    else result = render(wrapped)
    return result
  }

  type Args = Parameters<typeof useSpring>
  const update = (...args: [Args[0], Args[1]?]) =>
    renderWithContext((prevElem = <Component args={args} />))

  return [update, context] as const
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
