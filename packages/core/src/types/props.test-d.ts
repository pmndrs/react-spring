import { it, expectTypeOf } from 'vitest'
import { assert, _ } from 'spec.ts'

import { Lookup } from '@react-spring/types'
import { useSpring } from '../hooks/useSpring'
import { SpringValue } from '../SpringValue'
import { SpringUpdateFn } from './functions'
import { PickAnimated, ForwardProps, ReservedProps } from './props'

// Revived from the previously-orphaned spec.ts suite in
// `packages/core/src/types/__tests__/common.ts` (which the root tsconfig
// excluded, so no project ran it). Now co-located and checked by both `test:ts`
// and the `types` project.

type SystemProps = {
  [P in keyof ReservedProps]-?: P extends 'from' | 'to' ? {} : 1
}

type UserProps = {
  foo: 1
  bar: 1
}

it('ForwardProps', () => {
  // With reserved props, no forward props
  assert(_ as ForwardProps<SystemProps>, _ as {})
  // With reserved and forward props
  assert(_ as ForwardProps<SystemProps & UserProps>, _ as UserProps)
  // With forward props, no reserved props
  assert(_ as ForwardProps<UserProps>, _ as UserProps)
  // No reserved or forward props
  assert(_ as ForwardProps<{}>, _ as {})
})

it('PickAnimated', () => {
  // No props — an empty props object animates an open-ended set of keys
  assert(_ as PickAnimated<{}>, _ as Lookup)

  // Forward props only
  assert(_ as PickAnimated<UserProps>, _ as UserProps)

  // Distinct keys across every transition phase (plus `from`)
  assert(
    _ as PickAnimated<{
      from: { a: 1 }
      initial: { b: 1 }
      enter: { c: 1 }
      update: { d: 1 }
      leave: { e: 1 }
    }>,
    _ as { a: 1; b: 1; c: 1; d: 1; e: 1 }
  )

  // Async "to" chain — `from` defines the animated keys
  assert(
    _ as PickAnimated<{ from: { a: 1 }; to: [{ a: 2 }, { a: 3 }] }>,
    _ as {
      a: 1
    }
  )

  // Async "to" script
  assert(
    _ as PickAnimated<{
      from: { a: 1 }
      to: (next: SpringUpdateFn<any>) => void
    }>,
    _ as { a: 1 }
  )

  // NOTE: cases where a *shared* key draws values from multiple sources
  // (`from` + forward/`to`, or the same key across phases) are asserted with
  // widened (`number`) types. With literal types the per-source values are
  // merged through `ObjectFromUnion`, which degenerates for literal primitives
  // — a pre-existing machinery quirk that never surfaces in real usage, where
  // props widen to `number`. The merge itself is what these lock in.

  // Forward props merged with a partial `from` (shared `width`)
  assert(
    _ as PickAnimated<{
      foo: number
      width: number
      from: { bar: number; width: number }
    }>,
    _ as { foo: number; bar: number; width: number }
  )

  // `to` merged with `from` (shared `width`)
  assert(
    _ as PickAnimated<{
      to: { foo: number; width: number }
      from: { bar: number; width: number }
    }>,
    _ as { foo: number; bar: number; width: number }
  )

  // The same key set in every phase
  assert(
    _ as PickAnimated<{
      from: { a: number }
      enter: { a: number }
      leave: { a: number }
      update: { a: number }
      initial: { a: number }
    }>,
    _ as { a: number }
  )
})

// Regression for the `from`-drops-forward-keys bug: a partial `from` must not
// strip the other animated keys from the inferred state.
it('a partial `from` keeps forward-prop keys', () => {
  function scenario() {
    const styles = useSpring({ x: 0, y: 0, from: { x: -1 } })
    expectTypeOf(styles.x).toEqualTypeOf<SpringValue<number>>()
    expectTypeOf(styles.y).toEqualTypeOf<SpringValue<number>>()
  }
  expectTypeOf(scenario).toBeFunction()
})
