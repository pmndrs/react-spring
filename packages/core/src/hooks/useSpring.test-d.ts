import { it, expectTypeOf } from 'vitest'

import { useSpring } from './useSpring'

/**
 * Guard for the per-key event-handler `any` leak fixed under #2541.
 *
 * The per-key (object) form of an event handler — `onChange: { x: result => … }`
 * — types `result.value` as the key's value type (here, `number`). It used to
 * leak `any`: a callback inline in the same object literal that `useSpring`'s
 * `Props` generic is inferred from could not be contextually typed from the
 * still-inferring generic, so the param degraded to `any`. `EventfulProps`
 * (see `types/common.ts`) sources the handler keys from the resolved props via
 * `NoInfer`, so the state resolves first and per-key handlers get the key type.
 */
it('per-key event handlers: result.value matches the key value type', () => {
  function scenario() {
    useSpring({
      x: 0,
      onStart: { x: r => expectTypeOf(r.value).toEqualTypeOf<number>() },
      onChange: { x: r => expectTypeOf(r.value).toEqualTypeOf<number>() },
      onRest: { x: r => expectTypeOf(r.value).toEqualTypeOf<number>() },
      onPause: { x: r => expectTypeOf(r.value).toEqualTypeOf<number>() },
      onResume: { x: r => expectTypeOf(r.value).toEqualTypeOf<number>() },
    })
  }
  expectTypeOf(scenario).toBeFunction()
})
