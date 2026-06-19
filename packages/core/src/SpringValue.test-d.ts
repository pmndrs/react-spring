import { it, expectTypeOf } from 'vitest'

import { SpringValue } from './SpringValue'

/**
 * Guard for #2183 — "Incorrect result type in SpringValue `onChange` handler".
 *
 * The reported symptom is a TYPE/RUNTIME mismatch: the type claims
 * `result.value` is `number`, but at runtime it logs `undefined` mid-animation.
 * This test pins the type-level contract the issue relies on (the param is a
 * fully-typed `AnimationResult`, `result.value` is `number`, not `any`).
 *
 * Scenario lives inside a never-invoked function so the constructor is
 * type-checked by tsc but never executed by Vitest's runtime collection pass.
 */
it('#2183: SpringValue onChange result is typed, result.value is number (not any)', () => {
  function scenario() {
    // eslint-disable-next-line no-new
    new SpringValue(0, {
      onChange(result) {
        expectTypeOf(result).not.toBeAny()
        expectTypeOf(result.value).toEqualTypeOf<number>()
      },
    })
  }
  expectTypeOf(scenario).toBeFunction()
})
