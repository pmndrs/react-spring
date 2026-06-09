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
    it('is updated every render', async () => {
      await update({ x: 0 })
      expect(springs.x.goal).toBe(0)

      await update({ x: 1 })
      expect(springs.x.goal).toBe(1)
    })
    it('does not return a ref', async () => {
      await update({ x: 0 })
      expect(ref).toBeUndefined()
    })

    describe('when SpringContext has "pause={false}"', () => {
      it('stays paused if last rendered with "pause: true"', async () => {
        const props = { from: { t: 0 }, to: { t: 1 } }

        // Paused by context.
        await context.set({ pause: true })
        await update({ ...props, pause: false })
        expect(springs.t.isPaused).toBeTruthy()

        // Paused by props and context.
        await update({ ...props, pause: true })
        expect(springs.t.isPaused).toBeTruthy()

        // Paused by props.
        await context.set({ pause: false })
        expect(springs.t.isPaused).toBeTruthy()

        // Resumed.
        await update({ ...props, pause: false })
        expect(springs.t.isPaused).toBeFalsy()
      })
    })
  })

  describe('when both a props object and a deps array are passed', () => {
    it('is updated only when a dependency changes', async () => {
      await update({ x: 0 }, [1])
      expect(springs.x.goal).toBe(0)

      await update({ x: 1 }, [1])
      expect(springs.x.goal).toBe(0)

      await update({ x: 1 }, [2])
      expect(springs.x.goal).toBe(1)
    })
    it('returns a ref', async () => {
      await update({ x: 0 }, [1])
      testIsRef(ref)
    })
  })

  describe('when only a props function is passed', () => {
    it('is never updated on render', async () => {
      await update(() => ({ x: 0 }))
      expect(springs.x.goal).toBe(0)

      await update(() => ({ x: 1 }))
      expect(springs.x.goal).toBe(0)
    })
    it('returns a ref', async () => {
      await update(() => ({ x: 0 }))
      testIsRef(ref)
    })
  })

  describe('when both a props function and a deps array are passed', () => {
    it('is updated when a dependency changes', async () => {
      await update(() => ({ x: 0 }), [1])
      expect(springs.x.goal).toBe(0)

      await update(() => ({ x: 1 }), [1])
      expect(springs.x.goal).toBe(0)

      await update(() => ({ x: 1 }), [2])
      expect(springs.x.goal).toBe(1)
    })
    it('returns a ref', async () => {
      await update(() => ({ x: 0 }), [1])
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

      await render(<Component />)

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

      await render(
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

      await render(
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

  // Regression tests for https://github.com/pmndrs/react-spring/issues/2361
  // (and the earlier https://github.com/pmndrs/react-spring/issues/2146).
  // A declarative `useSpring` with no ref should auto-animate on mount even
  // under StrictMode, whose double-mount (mount → simulated unmount → mount)
  // used to leave the controller stopped with an empty `updates` array.
  describe('when a declarative props object is passed with no ref (StrictMode)', () => {
    it('animates from→to on mount', async () => {
      const onStart = vi.fn()
      const onRest = vi.fn()
      let spring: SpringValue<number> | undefined

      function Component() {
        const springs = useSpring({
          from: { opacity: 0 },
          to: { opacity: 1 },
          config: { duration: 100 },
          onStart,
          onRest,
        })
        spring = springs.opacity as unknown as SpringValue<number>
        return null
      }

      await render(
        <React.StrictMode>
          <Component />
        </React.StrictMode>
      )
      await advanceUntilIdle()

      expect(spring?.get()).toBe(1)
      expect(onStart).toHaveBeenCalledTimes(1)
      expect(onRest).toHaveBeenCalledTimes(1)
    })

    it('keeps a looped animation running on mount', async () => {
      const onStart = vi.fn()
      let spring: SpringValue<number> | undefined

      function Component() {
        const springs = useSpring({
          from: { x: 0 },
          to: { x: 100 },
          loop: true,
          config: { duration: 100 },
          onStart,
        })
        spring = springs.x as unknown as SpringValue<number>
        return null
      }

      await render(
        <React.StrictMode>
          <Component />
        </React.StrictMode>
      )

      // A loop never goes idle, so step until it has driven the value forward.
      await advanceUntilValue(spring!, 50)

      expect(spring!.get()).toBeGreaterThanOrEqual(50)
      expect(spring!.isAnimating).toBe(true)
      expect(onStart).toHaveBeenCalled()
    })
  })

  // Regression test for https://github.com/pmndrs/react-spring/issues/1638
  // The original bug (v9.2.4): a spring with initial value 0 would not
  // animate when api.start() was called from useLayoutEffect on first render.
  // Workarounds were useEffect or initial value 0.0000001.
  describe('when the initial value is 0 and start() is called in useLayoutEffect', () => {
    it('animates to the new goal via imperative ref.start()', async () => {
      let api!: SpringRef<{ x: number }>
      let spring!: SpringValue<number>
      let getValue!: () => number

      function Component() {
        const [springs, springApi] = useSpring(() => ({ x: 0 }))
        api = springApi
        spring = springs.x
        getValue = () => springs.x.get()

        React.useLayoutEffect(() => {
          api.start({ x: 20 })
        }, [])

        return null
      }

      await render(<Component />)

      expect(spring.goal).toBe(20)
      expect(spring.isAnimating).toBe(true)

      await advance(1)
      expect(getValue()).toBeGreaterThan(0)
      expect(getValue()).toBeLessThan(20)

      await advanceUntilIdle()
      expect(getValue()).toBe(20)
    })

    it('animates when state set in useLayoutEffect drives a declarative useSpring', async () => {
      let spring!: SpringValue<number>
      let getValue!: () => number

      function Component({ target }: { target: number }) {
        const [v, setV] = React.useState(0)
        const springs = useSpring({ x: v })
        spring = springs.x
        getValue = () => springs.x.get()

        React.useLayoutEffect(() => {
          setV(target)
        }, [target])

        return null
      }

      await render(<Component target={20} />)

      expect(spring.goal).toBe(20)
      expect(spring.isAnimating).toBe(true)

      await advance(1)
      expect(getValue()).toBeGreaterThan(0)
      expect(getValue()).toBeLessThan(20)

      await advanceUntilIdle()
      expect(getValue()).toBe(20)
    })
  })

  // Regression test for https://github.com/pmndrs/react-spring/issues/1661
  // The bug (v9.2.4): api.set called inside an onResolve callback that also
  // triggers a React setState would not actually update the spring value —
  // the spring stayed at its previous goal.
  describe('when api.set is called inside onResolve alongside a React setState', () => {
    it('snaps the spring to the set value (event-driven repro from #1661)', async () => {
      let spring!: SpringValue<number>

      function Component() {
        const [count, setCount] = React.useState(0)
        const [springs, api] = useSpring(() => ({ opacity: 0 }))
        spring = springs.opacity as SpringValue<number>

        const onClick = () => {
          api.start({
            opacity: 1,
            onResolve: () => {
              setCount(c => c + 1)
              api.set({ opacity: 0 })
            },
          })
        }

        return (
          <button type="button" onClick={onClick}>
            count: {count}
          </button>
        )
      }

      const { getByRole } = await render(<Component />)
      await advanceUntilIdle()

      expect(spring.get()).toBe(0)
      expect(spring.goal).toBe(0)

      // First click: animate 0 -> 1, then onResolve snaps back to 0.
      await getByRole('button').click()
      await advanceUntilIdle()

      expect(spring.get()).toBe(0)
      expect(spring.goal).toBe(0)

      // Second click: must animate from 0 -> 1 again. In the v9.2.4 bug,
      // the spring's goal would still be 1 after the first cycle, so the
      // second click would do nothing.
      await getByRole('button').click()
      await advance(1)
      const valueMidAnim = spring.get()
      expect(valueMidAnim).toBeGreaterThan(0)
      expect(valueMidAnim).toBeLessThan(1)

      await advanceUntilIdle()
      expect(spring.get()).toBe(0)
    })
  })
})

interface TestContext extends ISpringContext {
  set(values: ISpringContext): Promise<void>
}

function createUpdater(Component: React.ComponentType<{ args: [any, any?] }>) {
  let prevElem: React.JSX.Element | undefined
  let result: Awaited<ReturnType<typeof render>> | undefined

  const context: TestContext = {
    async set(values) {
      Object.assign(this, values)
      if (prevElem) {
        await renderWithContext(prevElem)
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

  async function renderWithContext(elem: React.JSX.Element) {
    const wrapped = (
      <SpringContextProvider {...context}>{elem}</SpringContextProvider>
    )
    if (result) await result.rerender(wrapped)
    else result = await render(wrapped)
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
