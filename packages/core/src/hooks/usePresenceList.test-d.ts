import { it, expectTypeOf } from 'vitest'

import { SpringValue } from '../SpringValue'
import { SpringRef } from '../SpringRef'
import { PresenceEntry, PresenceKey, PresencePhase } from '../types'
import { usePresenceList } from './usePresence'

interface Todo {
  id: number
  text: string
}

it('usePresenceList infers the animated state and entry shape', () => {
  function scenario() {
    const todos: Todo[] = []
    const entries = usePresenceList(todos, {
      keys: todo => todo.id,
      from: { opacity: 0 },
      enter: { opacity: 1 },
      leave: { opacity: 0 },
    })
    expectTypeOf(entries).toEqualTypeOf<
      PresenceEntry<Todo, { opacity: number }>[]
    >()

    const [entry] = entries
    expectTypeOf(entry.key).toEqualTypeOf<PresenceKey>()
    expectTypeOf(entry.item).toEqualTypeOf<Todo>()
    expectTypeOf(entry.springs.opacity).toEqualTypeOf<SpringValue<number>>()
    expectTypeOf(entry.phase).toEqualTypeOf<PresencePhase>()
    expectTypeOf(entry.phase).toEqualTypeOf<'enter' | 'update' | 'leave'>()
    expectTypeOf(entry).not.toHaveProperty('ctrl')
  }
  expectTypeOf(scenario).toBeFunction()
})

it('usePresenceList infers the animated state from function-style props', () => {
  function scenario() {
    const entries = usePresenceList([1, 2], {
      from: () => ({ x: 0 }),
      enter: (item, i) => ({ x: item * i }),
      leave: [{ x: 0 }],
    })
    expectTypeOf(entries[0].springs.x).toEqualTypeOf<SpringValue<number>>()
  }
  expectTypeOf(scenario).toBeFunction()
})

it('usePresenceList infers the animated state from mixed chained phases (#2589)', () => {
  function scenario() {
    const entries = usePresenceList([1], {
      from: { opacity: 0, height: 0 },
      enter: { opacity: 1, height: 10 },
      leave: [{ opacity: 0 }, { height: 0 }],
    })
    expectTypeOf(entries[0].springs.opacity).toEqualTypeOf<
      SpringValue<number>
    >()
    expectTypeOf(entries[0].springs.height).toEqualTypeOf<SpringValue<number>>()
  }
  expectTypeOf(scenario).toBeFunction()
})

it('usePresenceList returns a ref with function props or deps', () => {
  function scenario() {
    const withFn = usePresenceList([1], () => ({
      from: { x: 0 },
      enter: { x: 1 },
    }))
    expectTypeOf(withFn).toEqualTypeOf<
      [PresenceEntry<number, { x: number }>[], SpringRef<{ x: number }>]
    >()

    const withDeps = usePresenceList(
      [1],
      { from: { x: 0 }, enter: { x: 1 } },
      []
    )
    expectTypeOf(withDeps).toEqualTypeOf<
      [PresenceEntry<number, { x: number }>[], SpringRef<{ x: number }>]
    >()
  }
  expectTypeOf(scenario).toBeFunction()
})

it('usePresenceList types per-key handler arguments (#2541)', () => {
  function scenario() {
    usePresenceList([1], {
      from: { x: 0 },
      enter: { x: 1 },
      onRest: {
        x: result => expectTypeOf(result.value).toEqualTypeOf<number>(),
      },
    })
  }
  expectTypeOf(scenario).toBeFunction()
})

it('usePresenceList passes "config" per spring key', () => {
  function scenario() {
    usePresenceList([1], {
      from: { x: 0 },
      enter: { x: 1 },
      config: key => {
        expectTypeOf(key).toEqualTypeOf<string>()
        return { tension: 100 }
      },
    })

    // Passed as a variable so every TypeScript version reports the error on
    // the call's line; TS < 7 reports a failed overload on the call, not the prop.
    const perItemConfig = {
      from: { x: 0 },
      enter: { x: 1 },
      config: (_item: number, _index: number, _phase: string) => ({
        tension: 100,
      }),
    }
    // @ts-expect-error item/phase-specific config belongs in the phase
    usePresenceList([1], perItemConfig)
  }
  expectTypeOf(scenario).toBeFunction()
})

it('usePresenceList only accepts known modes and boolean "expires"', () => {
  function scenario() {
    usePresenceList([1], { from: { x: 0 }, enter: { x: 1 }, mode: 'wait' })
    const unknownMode = {
      from: { x: 0 },
      enter: { x: 1 },
      mode: 'popLayout' as const,
    }
    // @ts-expect-error unknown mode
    usePresenceList([1], unknownMode)
    const numericExpires = { from: { x: 0 }, enter: { x: 1 }, expires: 100 }
    // @ts-expect-error numeric `expires` is not supported
    usePresenceList([1], numericExpires)
  }
  expectTypeOf(scenario).toBeFunction()
})
