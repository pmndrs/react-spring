import * as React from 'react'
import { render } from 'vitest-browser-react'
import { is } from '@react-spring/shared'
import { PresenceEntry, UsePresenceListProps } from '../types'
import { usePresenceList } from './usePresence'
import { useSpring } from './useSpring'
import { useChain } from './useChain'
import { SpringRef } from '../SpringRef'
import { useSpringRef } from './useSpringRef'
import { SpringContextProvider } from '../SpringContext'

type Props = UsePresenceListProps | (() => UsePresenceListProps)

describe('usePresenceList', () => {
  let entries: PresenceEntry[]
  let rendered: any[]
  let api: SpringRef | undefined

  afterEach(() => {
    result = undefined
  })

  const update = createUpdater(({ args }) => {
    const value: any = usePresenceList(...(args as [any, any]))
    const isTuple = is.fun(args[1]) || args.length == 3
    entries = isTuple ? value[0] : value
    api = isTuple ? value[1] : undefined
    rendered = entries.map(entry => entry.item)
    return null
  })

  const phases = () => entries.map(entry => `${entry.item}:${entry.phase}`)

  describe('when "leave" is an array', () => {
    it('keeps the entry until the last step has finished', async () => {
      const props = {
        from: { n: 0 },
        enter: { n: 1 },
        leave: [{ n: 0.5 }, { n: 0 }],
      }

      await update([1], props)
      await global.advanceUntilIdle()

      await update([], props)
      const { n } = entries[0].springs
      await global.advanceUntilValue(n, 0.5)
      await global.advance(5)
      expect(phases()).toEqual(['1:leave'])

      await global.advanceUntilIdle()
      expect(n.get()).toBe(0)
      expect(entries).toEqual([])
    })
  })

  describe('when "leave" is a function', () => {
    it('unmounts after leave', async () => {
      const props: UsePresenceListProps = {
        from: { n: 0 },
        enter: { n: 1 },
        leave: () => async (next: any) => {
          await next({ n: 0 })
        },
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
    it('still unmounts the entry', async () => {
      const props = {
        from: { t: 0 },
        enter: { t: 1 },
        leave: { t: 1 },
      }

      await update(true, props)
      expect(rendered).toEqual([true])
      await global.advanceUntilIdle()

      await update(false, props)
      await global.advanceUntilIdle()
      expect(rendered).toEqual([false])
    })
  })

  it('drops removed items straight away without "leave"', async () => {
    const props = { from: { n: 0 }, enter: { n: 1 } }
    await update([1, 2], props)
    await update([2], props)
    expect(rendered).toEqual([2])
  })

  it('has the "from" values on the first render', async () => {
    const values: number[] = []
    function Component({ items }: { items: number[] }) {
      const entries = usePresenceList(items, {
        from: { n: 0 },
        enter: { n: 1 },
      })
      entries.forEach(entry => values.push(entry.springs.n.get()))
      return null
    }

    const { rerender } = await render(<Component items={[]} />)
    await rerender(<Component items={[1]} />)
    expect(values.length).toBeGreaterThan(0)
    expect(values.every(value => value === 0)).toBe(true)
  })

  it('reverses a leaving entry when its key comes back, without a remount', async () => {
    const props = {
      from: { n: 0 },
      enter: { n: 1 },
      leave: { n: 0 },
    }

    await update([1], props)
    await global.advanceUntilIdle()
    const { n } = entries[0].springs

    await update([], props)
    await global.advanceUntil(() => n.get() < 0.5)

    await update([1], props)
    expect(phases()).toEqual(['1:enter'])
    expect(entries[0].springs.n).toBe(n)

    await global.advanceUntilIdle()
    expect(phases()).toEqual(['1:enter'])
    expect(entries[0].springs.n).toBe(n)
    expect(n.get()).toBe(1)
  })

  it('exposes the "update" phase', async () => {
    const props = { from: { n: 0 }, enter: { n: 1 }, update: { n: 2 } }
    await update([1], props)
    expect(phases()).toEqual(['1:enter'])
    await update([1], props)
    expect(phases()).toEqual(['1:update'])
    await global.advanceUntilIdle()
    expect(entries[0].springs.n.get()).toBe(2)
  })

  it('swaps in the new item for an existing key', async () => {
    const onRest = vi.fn()
    const props = {
      keys: (item: { id: number }) => item.id,
      from: { n: 0 },
      enter: { n: 1 },
      leave: { n: 0 },
      onRest,
    }
    await update([{ id: 1, v: 'a' }], props)
    await global.advanceUntilIdle()

    await update([{ id: 1, v: 'b' }], props)
    expect(rendered).toEqual([{ id: 1, v: 'b' }])

    onRest.mockClear()
    await update([], props)
    await global.advanceUntilIdle()
    expect(onRest).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.anything(),
      { id: 1, v: 'b' }
    )
  })

  it('uses "initial" only for the items present on mount', async () => {
    const props = {
      initial: { n: 2 },
      from: { n: 0 },
      enter: { n: 1 },
    }
    await update([1], props)
    expect(entries[0].springs.n.get()).toBe(2)

    await update([1, 2], props)
    expect(entries[1].springs.n.get()).toBe(0)
  })

  it('uses "from" when the list starts empty', async () => {
    const props = {
      initial: { n: 2 },
      from: { n: 0 },
      enter: { n: 1 },
    }
    await update([], props)
    await update([1], props)
    expect(entries[0].springs.n.get()).toBe(0)
  })

  it('makes the first "enter" instant when "initial" is null', async () => {
    await update([1], { initial: null, from: { n: 0 }, enter: { n: 1 } })
    await global.advance()
    expect(getFrames(entries[0].springs.n)).toEqual([])
    expect(entries[0].springs.n.get()).toBe(1)
  })

  describe('when "keys" is null', () => {
    it('reuses entries for identical items', async () => {
      const a = { v: 'a' }
      const b = { v: 'b' }
      const props = { keys: null, from: { n: 0 }, enter: { n: 1 } }

      await update([a], props)
      const [first] = entries
      await update([a, b], props)
      expect(entries[0].key).toBe(first.key)
      expect(entries[0].springs.n).toBe(first.springs.n)
      expect(entries[1].key).not.toBe(first.key)
    })
  })

  describe('when "expires" is false', () => {
    it('keeps leaving entries after their leave animation', async () => {
      const props = {
        from: { n: 0 },
        enter: { n: 1 },
        leave: { n: 0 },
        expires: false,
      }
      await update([1], props)
      await global.advanceUntilIdle()

      await update([], props)
      await global.advanceUntilIdle()
      expect(phases()).toEqual(['1:leave'])
      expect(entries[0].springs.n.get()).toBe(0)
    })
  })

  it('passes a "config" function to each spring with its key', async () => {
    const config = vi.fn(() => ({ duration: 10 }))
    await update([1], {
      from: { x: 0, y: 0 },
      enter: { x: 1, y: 1 },
      config,
    })
    await global.advanceUntilIdle()
    expect(config).toHaveBeenCalledWith('x')
    expect(config).toHaveBeenCalledWith('y')
    expect(config).not.toHaveBeenCalledWith(1, expect.anything())
  })

  it('uses "config" from a phase function for that item and phase', async () => {
    await update([1], {
      from: { x: 0 },
      enter: (item: number) => ({
        x: 1,
        config: { duration: item * 100 },
      }),
    })
    await global.advanceUntilIdle()
    expect(entries[0].springs.x.animation.config.duration).toBe(100)
  })

  it('assign controllers to provided "ref"', async () => {
    const ref = SpringRef()
    await update([1, 2, 3], { ref })
    expect(ref.current).toHaveLength(3)
    testIsRef(ref)
  })

  it('returns a ref if the props argument is a function', async () => {
    await update(true, () => ({
      from: { n: 0 },
      enter: { n: 1 },
      leave: { n: 0 },
    }))

    expect(rendered).toEqual([true])
    testIsRef(api!)
  })

  it('returns a ref if a deps argument is passed', async () => {
    await update(true, { from: { n: 0 }, enter: { n: 1 } }, [])
    expect(rendered).toEqual([true])
    testIsRef(api!)
  })

  // See https://github.com/pmndrs/react-spring/issues/2287
  it('auto-starts the enter animation when props is a function with deps', async () => {
    await update(
      true,
      () => ({
        from: { n: 0 },
        enter: { n: 1 },
        leave: { n: 0 },
      }),
      []
    )

    await global.advanceUntilIdle()
    expect(entries[0].springs.n.get()).toEqual(1)
  })

  it('enters and leaves items even when "deps" are unchanged', async () => {
    const props = () => ({
      from: { n: 0 },
      enter: { n: 1 },
      leave: { n: 0 },
    })

    await update([1], props, [])
    await update([1, 2], props, [])
    await global.advanceUntilIdle()
    expect(entries[1].springs.n.get()).toBe(1)

    await update([2], props, [])
    await global.advanceUntilIdle()
    expect(rendered).toEqual([2])
  })

  it('only applies "update" when "deps" change', async () => {
    let target = 1
    const props = () => ({
      from: { n: 0 },
      enter: { n: 1 },
      update: { n: target },
    })

    await update([1], props, [1])
    await global.advanceUntilIdle()

    target = 2
    await update([1], props, [1])
    await global.advanceUntilIdle()
    expect(entries[0].springs.n.get()).toBe(1)

    await update([1], props, [2])
    await global.advanceUntilIdle()
    expect(entries[0].springs.n.get()).toBe(2)
  })

  // An injected ref must keep deferring so manual/imperative control still
  // works (#1944).
  it('defers the enter animation until the injected ref is started', async () => {
    const ref = SpringRef()
    await update(true, {
      ref,
      from: { n: 0 },
      enter: { n: 1 },
      leave: { n: 0 },
    })

    await global.advanceUntilIdle()
    expect(entries[0].springs.n.get()).toEqual(0)

    ref.start()
    await global.advanceUntilIdle()
    expect(entries[0].springs.n.get()).toEqual(1)
  })

  it('sequences behind a spring with useChain', async () => {
    const springRef = SpringRef()
    const presenceRef = SpringRef()
    let n: any = null

    function Component() {
      useSpring({ ref: springRef, from: { x: 0 }, to: { x: 1 } })
      const entries = usePresenceList([1], {
        ref: presenceRef,
        from: { n: 0 },
        enter: { n: 1 },
        leave: { n: 0 },
      })
      n = entries[0].springs.n
      useChain([springRef, presenceRef])
      return null
    }

    await render(<Component />)

    global.mockRaf.step()
    expect(n.get()).toEqual(0)

    await global.advanceUntilIdle()
    expect(n.get()).toEqual(1)
  })

  // Every render runs under StrictMode (see test/setup.ts); this checks the
  // injected ref survives the mount → unmount → remount cycle (#1890/#1944).
  it('keeps an injected ref deferred across a StrictMode double-mount', async () => {
    const ref = SpringRef()
    let n: any = null

    function Component() {
      const entries = usePresenceList([1], {
        ref,
        from: { n: 0 },
        enter: { n: 1 },
        leave: { n: 0 },
      })
      n = entries[0].springs.n
      return null
    }

    await render(
      <React.StrictMode>
        <Component />
      </React.StrictMode>
    )

    await global.advanceUntilIdle()
    expect(n.get()).toEqual(0)

    expect(ref.current).toHaveLength(1)
    ref.start()
    await global.advanceUntilIdle()
    expect(n.get()).toEqual(1)
  })

  it('passes immediate through to payload', async () => {
    await update(true, {
      from: { n: 0 },
      enter: { n: 1 },
      leave: { n: 0 },
      immediate: true,
    })

    expect(entries[0].springs.n.animation.immediate).toEqual(true)
  })

  it('exposes phase "leave" during a normal leave', async () => {
    // Regression test for https://github.com/pmndrs/react-spring/issues/1654
    const props = {
      from: { n: 0 },
      enter: { n: 1 },
      leave: { n: 0 },
    }

    await update(true, props)
    await global.advanceUntilIdle()

    await update(false, props)
    expect(phases()).toEqual(['true:leave', 'false:enter'])
  })

  describe('when "mode" is "wait"', () => {
    it('re-enters a leaving item while the others still leave', async () => {
      const props = {
        from: { t: 0 },
        enter: { t: 1 },
        leave: { t: 0 },
        mode: 'wait' as const,
      }

      await update([0, 1], props)
      await global.advanceUntilIdle()

      await update([2], props)
      await global.advance(2)
      expect(phases()).toEqual(['0:leave', '1:leave'])

      await update([0, 2], props)
      expect(phases()).toEqual(['0:enter', '1:leave'])

      await global.advanceUntilIdle()
      expect(phases()).toEqual(['0:enter', '2:enter'])
      expect(entries.map(entry => entry.springs.t.get())).toEqual([1, 1])
    })

    it('adds held items once the leaving items finish, even when "expires" is false', async () => {
      const props = {
        from: { t: 0 },
        enter: { t: 1 },
        leave: { t: 0 },
        mode: 'wait' as const,
        expires: false,
      }

      await update([0], props)
      await global.advanceUntilIdle()

      await update([1], props)
      expect(phases()).toEqual(['0:leave'])

      await global.advanceUntilIdle()
      expect(phases()).toEqual(['0:leave', '1:enter'])
      expect(entries[1].springs.t.get()).toBe(1)
    })

    it('starts only the held items without the injected ref', async () => {
      const ref = SpringRef()
      const props = {
        ref,
        from: { t: 0 },
        enter: { t: 1 },
        leave: { t: 0 },
        mode: 'wait' as const,
      }

      await update([0], props)
      ref.start()
      await global.advanceUntilIdle()

      await update([1], props)
      expect(rendered).toEqual([0])

      // Without "leave", 0 is dropped and the held 1 is added in the same
      // render as the brand-new 2.
      await update([1, 2], { ...props, leave: undefined })
      await global.advanceUntilIdle()
      expect(rendered).toEqual([1, 2])
      expect(entries.map(entry => entry.springs.t.get())).toEqual([1, 0])
    })

    it('waits for every leaving item in a list, with "trail"', async () => {
      const props = {
        from: { t: 0 },
        enter: { t: 1 },
        leave: { t: 0 },
        mode: 'wait' as const,
        trail: 100,
      }

      await update([0, 1], props)
      await global.advanceUntilIdle()

      await update([2, 3], props)
      await global.advance()
      expect(phases()).toEqual(['0:leave', '1:leave'])

      await global.advanceUntilIdle()

      expect(rendered).toEqual([2, 3])
      expect(entries.map(entry => entry.springs.t.get())).toEqual([1, 1])
    })

    it('starts released items even with an injected ref', async () => {
      const ref = SpringRef()
      const props = {
        ref,
        from: { t: 0 },
        enter: { t: 1 },
        leave: { t: 0 },
        mode: 'wait' as const,
      }

      await update([0], props)
      ref.start()
      await global.advanceUntilIdle()

      await update([1], props)
      ref.start()
      await global.advanceUntilIdle()

      expect(rendered).toEqual([1])
      await global.advanceUntilIdle()
      expect(entries[0].springs.t.get()).toBe(1)
    })
  })

  describe('when "reverse" is true', () => {
    // Regression for https://github.com/pmndrs/react-spring/issues/1794
    it('reverses the trail order across leaving items', async () => {
      const leaveStart: number[] = []
      const props: UsePresenceListProps<number> = {
        from: { n: 0 },
        enter: { n: 1 },
        leave: (item: number) => ({
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
      const props: UsePresenceListProps<number> = {
        from: { n: 0 },
        enter: { n: 1 },
        leave: (item: number) => ({
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

  it('passes a "delay" function to each spring with its key, plus the trail', async () => {
    const delay = vi.fn((key: string) => (key == 'x' ? 100 : 0))
    await update([1, 2], {
      from: { x: 0, y: 0 },
      enter: { x: 1, y: 1 },
      delay,
      trail: 100,
    })
    expect(delay).toHaveBeenCalledWith('x')
    expect(delay).toHaveBeenCalledWith('y')
    expect(delay).not.toHaveBeenCalledWith(1)

    await global.advanceByTime(150)
    const [first, second] = entries.map(entry => entry.springs)
    expect(first.x.get()).toBeGreaterThan(0)
    expect(second.y.get()).toBeGreaterThan(0)
    expect(second.x.get()).toBe(0)
  })

  it('uses a string or number key when the items are objects without "keys"', async () => {
    const a = {}
    const b = {}
    const props = { from: { n: 0 }, enter: { n: 1 } }

    await update([a, b], props)
    const keys = entries.map(entry => entry.key)
    expect(keys.every(key => is.num(key) || is.str(key))).toBe(true)
    expect(new Set(keys).size).toBe(2)

    await update([b, a], props)
    expect(entries.map(entry => entry.key)).toEqual([keys[1], keys[0]])
  })

  it('does not report or trail an "update" that "deps" hold back', async () => {
    const props = () => ({
      from: { n: 0 },
      enter: { n: 1 },
      update: { n: 2 },
      trail: 100,
    })

    await update([1], props, [])
    await global.advanceUntilIdle()

    await update([1, 2], props, [])
    expect(phases()).toEqual(['1:enter', '2:enter'])

    await global.advance(2)
    expect(entries[1].springs.n.get()).toBeGreaterThan(0)
  })

  it('removes its controllers from an injected ref on unmount', async () => {
    const ref = SpringRef()
    await update([1, 2], { ref, from: { n: 0 }, enter: { n: 1 } })
    expect(ref.current).toHaveLength(2)

    result!.unmount()
    expect(ref.current).toHaveLength(0)
  })

  it('removes dropped controllers from an injected ref', async () => {
    const ref = SpringRef()
    const props = { ref, from: { n: 0 }, enter: { n: 1 }, leave: { n: 0 } }

    await update([1, 2, 3], props)
    ref.start()
    await global.advanceUntilIdle()

    await update([2, 3], props)
    ref.start()
    await global.advanceUntilIdle()
    expect(rendered).toEqual([2, 3])
    expect(ref.current).toHaveLength(2)

    await update([3], { ...props, leave: undefined })
    expect(ref.current).toHaveLength(1)
  })

  it('applies SpringContext to new and existing entries', async () => {
    let entries: PresenceEntry[] = []
    function Child({ items }: { items: number[] }) {
      entries = usePresenceList(items, { from: { n: 0 }, enter: { n: 1 } })
      return null
    }
    const values = () => entries.map(entry => entry.springs.n.get())

    const { rerender } = await render(
      <SpringContextProvider pause>
        <Child items={[1]} />
      </SpringContextProvider>
    )
    await global.advance(5)
    expect(values()).toEqual([0])

    await rerender(
      <SpringContextProvider pause>
        <Child items={[1, 2]} />
      </SpringContextProvider>
    )
    await global.advance(5)
    expect(values()).toEqual([0, 0])

    await rerender(
      <SpringContextProvider pause={false}>
        <Child items={[1, 2]} />
      </SpringContextProvider>
    )
    await global.advanceUntilIdle()
    expect(values()).toEqual([1, 1])
  })

  it('stops its controllers on unmount', async () => {
    await update([1], { from: { n: 0 }, enter: { n: 1 } })
    const { n } = entries[0].springs
    global.mockRaf.step()
    result!.unmount()
    expect(n.idle).toBe(true)
  })
})

describe('usePresenceList with concurrent rendering', () => {
  let setItems: (items: number[]) => void
  let setPromise: (promise: Promise<void> | null) => void
  let ref: SpringRef
  // The entries of the last commit.
  let entries: PresenceEntry[]
  // The phases of every commit.
  let commits: string[][]
  // The latest entry returned for each item, including renders React threw away.
  let seen: Map<number, PresenceEntry>

  beforeEach(() => {
    entries = []
    commits = []
    seen = new Map()
  })

  const phases = () => entries.map(entry => `${entry.item}:${entry.phase}`)

  function List({ items, withRef }: { items: number[]; withRef: boolean }) {
    ref = useSpringRef()
    const list = usePresenceList(items, {
      ref: withRef ? ref : undefined,
      from: { n: 0 },
      enter: { n: 1 },
      leave: { n: 0 },
    })
    list.forEach(entry => seen.set(entry.item, entry))
    React.useLayoutEffect(() => {
      entries = list
      commits.push(list.map(entry => `${entry.item}:${entry.phase}`))
    })
    return null
  }

  function Suspender({ promise }: { promise: Promise<void> | null }) {
    if (promise) React.use(promise)
    return null
  }

  function App({ initial, withRef }: { initial: number[]; withRef: boolean }) {
    const [items, setItemsState] = React.useState(initial)
    const [promise, setPromiseState] = React.useState<Promise<void> | null>(
      null
    )
    setItems = setItemsState
    setPromise = setPromiseState
    return (
      <React.Suspense fallback={null}>
        <List items={items} withRef={withRef} />
        <Suspender promise={promise} />
      </React.Suspense>
    )
  }

  const mount = (initial: number[], withRef = false) =>
    render(<App initial={initial} withRef={withRef} />)

  const suspendIn = (update: () => void) => {
    const suspended = deferred()
    React.startTransition(() => {
      update()
      setPromise(suspended.promise)
    })
    return suspended
  }

  it('leaves no trace of a render React throws away', async () => {
    await mount([1], true)
    ref.start()
    await global.advanceUntilIdle()

    let suspended!: Deferred
    await React.act(async () => {
      suspended = suspendIn(() => setItems([1, 2]))
    })
    // Item 2 was rendered, but the transition suspended before committing.
    expect(seen.has(2)).toBe(true)
    expect(phases()).toEqual(['1:enter'])
    expect(ref.current).toHaveLength(1)

    // A newer transition supersedes it, so item 2 is never committed.
    await React.act(async () => {
      React.startTransition(() => {
        setItems([1])
        setPromise(null)
      })
    })
    expect(phases()).toEqual(['1:enter'])
    expect(ref.current).toHaveLength(1)

    const discarded = seen.get(2)!.springs.n
    ref.start()
    await global.advanceUntilIdle()
    expect(discarded.idle).toBe(true)
    expect(discarded.get()).toBe(0)
    expect(commits.flat().some(phase => phase.startsWith('2:'))).toBe(false)

    // Adding it for real works as normal.
    await React.act(async () => setItems([1, 2]))
    expect(phases()).toEqual(['1:enter', '2:enter'])
    expect(ref.current).toHaveLength(2)
    ref.start()
    await global.advanceUntilIdle()
    expect(entries.map(entry => entry.springs.n.get())).toEqual([1, 1])

    await React.act(async () => suspended.resolve())
  })

  it('commits an urgent update over a suspended transition', async () => {
    await mount([1])
    await global.advanceUntilIdle()

    let suspended!: Deferred
    await React.act(async () => {
      suspended = suspendIn(() => setItems([2]))
    })
    expect(phases()).toEqual(['1:enter'])
    expect(seen.get(2)?.phase).toBe('enter')

    await React.act(async () => setItems([3]))
    expect(phases()).toEqual(['1:leave', '3:enter'])

    // The transition is rebased on the urgent update when it resumes.
    await React.act(async () => {
      suspended.resolve()
      await suspended.promise
    })
    await global.advanceUntilIdle()
    expect(phases()).toEqual(['3:enter'])
    expect(entries[0].springs.n.get()).toBe(1)
    expect(commits.flat().some(phase => phase.startsWith('2:'))).toBe(false)
  })

  it('finishes a leave while a transition that re-adds the item is suspended', async () => {
    await mount([1])
    await global.advanceUntilIdle()

    await React.act(async () => setItems([]))
    expect(phases()).toEqual(['1:leave'])
    const { n } = entries[0].springs
    await global.advanceUntil(() => n.get() < 0.5)

    let suspended!: Deferred
    await React.act(async () => {
      suspended = suspendIn(() => setItems([1]))
    })
    expect(seen.get(1)?.phase).toBe('enter')
    // The re-enter was never committed, so the leave carries on.
    expect(phases()).toEqual(['1:leave'])
    await global.advanceUntilIdle()
    expect(n.get()).toBe(0)
    expect(phases()).toEqual([])

    // Once the transition commits, the item enters again from `from`.
    await React.act(async () => {
      suspended.resolve()
      await suspended.promise
    })
    expect(phases()).toEqual(['1:enter'])
    expect(entries[0].springs.n.get()).toBe(0)
    await global.advanceUntilIdle()
    expect(entries[0].springs.n.get()).toBe(1)
  })
})

interface Deferred {
  promise: Promise<void>
  resolve: () => void
}

function deferred(): Deferred {
  let resolve!: () => void
  const promise = new Promise<void>(done => (resolve = done))
  return { promise, resolve }
}

let result: Awaited<ReturnType<typeof render>> | undefined
function createUpdater(
  Component: React.ComponentType<{ args: [any, Props, any[]?] }>
) {
  return async (...args: [any, any, any[]?]) => {
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
