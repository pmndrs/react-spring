import * as React from 'react'
import { render } from 'vitest-browser-react'
import { is } from '@react-spring/shared'
import { Lookup } from '@react-spring/types'
import { SpringContextProvider, type ISpringContext } from '../SpringContext'
import { SpringValue } from '../SpringValue'
import { SpringRef } from '../SpringRef'
import { useSpring } from './useSpring'
import { useSpringRef } from './useSpringRef'

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

  // Regression test for https://github.com/pmndrs/react-spring/issues/1991
  describe('when an external SpringRef is attached via the `ref` prop', () => {
    it('fires events declared on render when `ref.start()` is called with no args', async () => {
      const externalRef = SpringRef()
      const onStart = vi.fn()
      const onRest = vi.fn()

      function Component() {
        useSpring({
          ref: externalRef,
          from: { x: 0 },
          to: { x: 100 },
          onStart,
          onRest,
        })
        return null
      }

      render(<Component />)

      // Animation should not start until `ref.start()` is called.
      expect(onStart).not.toHaveBeenCalled()

      externalRef.start()
      await advanceUntilIdle()

      expect(onStart).toHaveBeenCalledTimes(1)
      expect(onRest).toHaveBeenCalledTimes(1)
    })

    it('fires events under StrictMode (double-mount)', async () => {
      const onStart = vi.fn()
      const onRest = vi.fn()
      let capturedRef: SpringRef | undefined

      function Component() {
        const springRef = useSpringRef()
        capturedRef = springRef

        useSpring({
          ref: springRef,
          from: { x: 0 },
          to: { x: 100 },
          onStart,
          onRest,
        })

        React.useEffect(() => {
          springRef.start()
        }, [springRef])

        return null
      }

      render(
        <React.StrictMode>
          <Component />
        </React.StrictMode>
      )
      await advanceUntilIdle()

      expect(capturedRef).toBeDefined()
      expect(onStart).toHaveBeenCalledTimes(1)
      expect(onRest).toHaveBeenCalledTimes(1)
    })

    // Exact reproduction from the issue body.
    it('fires events when `springRef.start()` is called from a useEffect (issue #1991 repro)', async () => {
      const onStart = vi.fn()
      const onRest = vi.fn()
      let capturedRef: SpringRef | undefined

      function Component() {
        const springRef = useSpringRef()
        capturedRef = springRef

        useSpring({
          ref: springRef,
          config: { duration: 1000 },
          from: {
            position: 'relative',
            opacity: 1,
            right: 0,
          },
          to: {
            position: 'relative',
            opacity: 0,
            right: -300,
          },
          onStart,
          onRest,
        })

        React.useEffect(() => {
          springRef.start()
        }, [springRef])

        return null
      }

      render(
        <React.StrictMode>
          <Component />
        </React.StrictMode>
      )
      await advanceUntilIdle()

      expect(capturedRef).toBeDefined()
      expect(onStart).toHaveBeenCalledTimes(1)
      expect(onRest).toHaveBeenCalledTimes(1)
    })
  })
})

interface TestContext extends ISpringContext {
  set(values: ISpringContext): void
}

function createUpdater(Component: React.ComponentType<{ args: [any, any?] }>) {
  let prevElem: React.JSX.Element | undefined
  let result: ReturnType<typeof render> | undefined

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

  function renderWithContext(elem: React.JSX.Element) {
    const wrapped = (
      <SpringContextProvider {...context}>{elem}</SpringContextProvider>
    )
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
