import { it, expectTypeOf } from 'vitest'

import { useSprings } from './useSprings'

/**
 * KNOWN LIMITATION (#2541).
 *
 * The per-key event-handler `any` leak is fixed for `useSpring` and
 * `useTransition`, but NOT for `useSprings`. `useSprings` infers a single `Props`
 * from its props ARRAY via best-common-type element inference, which is
 * fundamentally incompatible with the mapped-type + `NoInfer` phasing that fixes
 * the leak (`EventfulProps`): wrapping the array element makes per-key handlers
 * resolve from only the FIRST element and turns valid multi-element,
 * heterogeneous arrays into hard errors. Its function form leaks for the same
 * reason `useSpring`'s does — a callback inside a function *return* can't be
 * contextually typed from the still-inferring generic.
 *
 * So a `useSprings` per-key handler callback isn't typed at all (its param is
 * implicit `any`). This guard locks that in: if a future TypeScript lets the
 * phasing compose with array inference, the `@ts-expect-error` goes unused and
 * this should be revisited.
 */
it('#2541: useSprings per-key handler is untyped (array-inference limitation)', () => {
  function scenario() {
    useSprings(1, [
      {
        x: 0,
        // @ts-expect-error per-key handler param leaks to implicit `any` (#2541)
        onChange: { x: result => void result },
      },
    ])
  }
  expectTypeOf(scenario).toBeFunction()
})
