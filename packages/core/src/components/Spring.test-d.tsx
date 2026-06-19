import * as React from 'react'
import { it, expectTypeOf } from 'vitest'

import { SpringValue } from '../SpringValue'
import { Spring } from './Spring'

/**
 * Guard for #2006 — "render prop within <Spring> is inferred to any".
 *
 * The render prop should be inferred from `from`/`to` as a `SpringValues`
 * object (e.g. `{ opacity: SpringValue<number>, color: SpringValue<string> }`),
 * not `any` (which breaks consumers under `noImplicitAny`).
 */
// `to`-based overload (state inferred from `to`).
it('#2006: <Spring to> render prop is inferred as SpringValues, not any', () => {
  function scenario() {
    return (
      <Spring to={{ opacity: 1, color: 'blue' }}>
        {styles => {
          expectTypeOf(styles).not.toBeAny()
          expectTypeOf(styles.opacity).toEqualTypeOf<SpringValue<number>>()
          expectTypeOf(styles.color).toEqualTypeOf<SpringValue<string>>()
          return null
        }}
      </Spring>
    )
  }
  expectTypeOf(scenario).toBeFunction()
})

// `from`-based overload (overload 1) — the exact shape from the issue's repo.
it('#2006: <Spring from> render prop is inferred as SpringValues, not any', () => {
  function scenario() {
    return (
      <Spring from={{ opacity: 0, color: 'red' }}>
        {styles => {
          expectTypeOf(styles).not.toBeAny()
          expectTypeOf(styles.opacity).toEqualTypeOf<SpringValue<number>>()
          expectTypeOf(styles.color).toEqualTypeOf<SpringValue<string>>()
          return null
        }}
      </Spring>
    )
  }
  expectTypeOf(scenario).toBeFunction()
})
