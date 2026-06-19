import { it, expectTypeOf } from 'vitest'

import { SpringValue } from '../SpringValue'
import { useTransition } from './useTransition'

/**
 * Guard for #1114 — "Type definition for `onDestroyed` is wrong".
 *
 * Originally typed `(isDestroyed: boolean) => void`; the issue asked for the
 * transitioning item. The current source types it `(item: Item, key: Key)`,
 * so this guard LOCKS IN that fix (item inferred from the data) rather than
 * reproducing a regression.
 */
it('#1114: useTransition onDestroyed receives the typed item (not boolean/any)', () => {
  function scenario() {
    const items: number[] = [1, 2, 3]
    useTransition(items, {
      from: { opacity: 0 },
      enter: { opacity: 1 },
      leave: { opacity: 0 },
      onDestroyed(item) {
        expectTypeOf(item).not.toBeAny()
        expectTypeOf(item).toEqualTypeOf<number>()
      },
    })
  }
  expectTypeOf(scenario).toBeFunction()
})

/**
 * Guard for #1483 — "Type inference fails when useTransition styles are set via
 * functions".
 *
 * When `from`/`enter`/`leave` are functions returning style objects, the
 * animated state should still be inferred (e.g. `{ sx, sy }`), so the render
 * prop's `styles` is `SpringValues<{ sx: number; sy: number }>` — not `{}`
 * (the reported regression) nor `any`.
 */
it('#1483: useTransition infers animated state from function-style props', () => {
  function scenario() {
    const items: number[] = [1, 2, 3]
    const transition = useTransition(items, {
      from: () => ({ sx: 0, sy: 0 }),
      enter: () => ({ sx: 1, sy: 1 }),
      leave: () => ({ sx: 0, sy: 0 }),
    })
    transition(styles => {
      expectTypeOf(styles).not.toBeAny()
      expectTypeOf(styles.sx).toEqualTypeOf<SpringValue<number>>()
      expectTypeOf(styles.sy).toEqualTypeOf<SpringValue<number>>()
      return null
    })
  }
  expectTypeOf(scenario).toBeFunction()
})
