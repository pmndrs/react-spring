import { it, expectTypeOf } from 'vitest'

import { SpringValue } from '../SpringValue'
import { SpringRef } from '../SpringRef'
import { Presence, PresencePhase } from '../types'
import { usePresence } from './usePresence'

it('usePresence returns nullable springs and phase', () => {
  function scenario(open: boolean) {
    const presence = usePresence(open, {
      from: { opacity: 0 },
      enter: { opacity: 1 },
      leave: { opacity: 0 },
    })
    expectTypeOf(presence).toEqualTypeOf<Presence<{
      opacity: number
    }> | null>()

    if (presence) {
      expectTypeOf(presence.springs.opacity).toEqualTypeOf<
        SpringValue<number>
      >()
      expectTypeOf(presence.phase).toEqualTypeOf<PresencePhase>()
    }
  }
  expectTypeOf(scenario).toBeFunction()
})

it('usePresence returns a ref with function props or deps', () => {
  function scenario(open: boolean) {
    const withFn = usePresence(open, () => ({
      from: { x: 0 },
      enter: { x: 1 },
    }))
    expectTypeOf(withFn).toEqualTypeOf<
      [Presence<{ x: number }> | null, SpringRef<{ x: number }>]
    >()

    const withDeps = usePresence(open, { from: { x: 0 }, enter: { x: 1 } }, [])
    expectTypeOf(withDeps).toEqualTypeOf<
      [Presence<{ x: number }> | null, SpringRef<{ x: number }>]
    >()
  }
  expectTypeOf(scenario).toBeFunction()
})

it('usePresence phase functions take no arguments', () => {
  function scenario(open: boolean) {
    const presence = usePresence(open, {
      from: () => ({ x: 0 }),
      enter: () => ({ x: 1 }),
    })
    expectTypeOf(presence!.springs.x).toEqualTypeOf<SpringValue<number>>()

    // Passed as a variable so every TypeScript version reports the error on
    // the call's line; TS < 7 reports a failed overload on the call, not the prop.
    const withArgs = {
      from: { x: 0 },
      enter: (_item: boolean, _index: number) => ({ x: 1 }),
    }
    // @ts-expect-error there is no item or index for a boolean
    usePresence(open, withArgs)
  }
  expectTypeOf(scenario).toBeFunction()
})

it('usePresence types per-key handler arguments (#2541)', () => {
  function scenario(open: boolean) {
    usePresence(open, {
      from: { x: 0 },
      enter: { x: 1 },
      onChange: {
        x: result => expectTypeOf(result.value).toEqualTypeOf<number>(),
      },
    })
  }
  expectTypeOf(scenario).toBeFunction()
})
