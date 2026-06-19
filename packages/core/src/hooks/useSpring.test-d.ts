import { it, expectTypeOf } from 'vitest'

import { useSpring } from './useSpring'

/**
 * Guard for a known `any` leak found while sweeping the public surface for
 * #2541.
 *
 * The per-key (object) form of an event handler — `onChange: { x: result => … }`
 * — should type `result.value` as the key's value type (here, `number`). It
 * does not: `result.value` is `any` at the inline call site.
 *
 * Root cause is a TypeScript limitation, NOT a wrong type definition: a callback
 * written inline in the same object literal that `useSpring`'s generic `Props`
 * is inferred from cannot be contextually typed from that (still-inferring)
 * generic, so the param degrades to `any`. With an explicit annotation
 * (`const p: ControllerProps<{ x: number }> = …`) the same handler types
 * `result.value` as `number`, which confirms the definitions are fine. A real
 * fix needs the hooks to separate state-inference from handler-typing.
 *
 * The assertion below is the type we WANT. The `@ts-expect-error` suppresses the
 * current mismatch; when the limitation is resolved the error disappears, the
 * directive becomes unused (a type error in its own right), and this test goes
 * red — at which point delete the directive.
 */
it('per-key onChange: result.value should match the key value type', () => {
  function scenario() {
    useSpring({
      x: 0,
      onChange: {
        // @ts-expect-error known limitation: result.value is `any`, not `number` (#2541)
        x: result => expectTypeOf(result.value).toEqualTypeOf<number>(),
      },
    })
  }
  expectTypeOf(scenario).toBeFunction()
})
