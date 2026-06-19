import { it, expectTypeOf } from 'vitest'
import { assert, _ } from 'spec.ts'

import { interpolate } from './interpolate'
import { SpringValue } from './SpringValue'
import { Interpolation } from './Interpolation'

// Revived from the previously-orphaned spec.ts suite in
// `packages/core/src/types/__tests__/interpolate.ts`. Now co-located and run by
// the `types` project. Expectations updated: `interpolate` returns an
// `Interpolation`, not a `SpringValue`.
//
// `interpolate` is called inside never-invoked functions so the calls are
// type-checked by tsc but never executed by Vitest's runtime collection pass.

/** Return the arguments as-is */
const args = <T extends ReadonlyArray<any>>(...args: T) => args

it('with one SpringValue', () => {
  function scenario() {
    // Basic value (a single spring value spreads to a readonly array)
    const out1 = interpolate(_ as SpringValue<number>, args)
    assert(out1, _ as Interpolation<readonly number[]>)

    // Array value
    const out2 = interpolate(_ as SpringValue<[number, number]>, args)
    assert(out2, _ as Interpolation<[number, number]>)
  }
  expectTypeOf(scenario).toBeFunction()
})

it('with an array of SpringValues', () => {
  function scenario() {
    // 1 value
    const out1 = interpolate(_ as [SpringValue<number>], args)
    assert(out1, _ as Interpolation<[number]>)

    // 2 values
    const out2 = interpolate(
      _ as [SpringValue<number>, SpringValue<string>],
      args
    )
    assert(out2, _ as Interpolation<[number, string]>)

    // Infinite values
    const out3 = interpolate(_ as SpringValue<number>[], args)
    assert(out3, _ as Interpolation<number[]>)
  }
  expectTypeOf(scenario).toBeFunction()
})
