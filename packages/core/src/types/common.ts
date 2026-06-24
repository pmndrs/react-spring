import { Remap, Any } from '@react-spring/types'
import { FluidValue } from '@react-spring/shared'

import type { EventKey } from './internal'

/** Replace the type of each `T` property with `never` (unless compatible with `U`) */
export type Valid<T, U> = NeverProps<T, InvalidKeys<T, U>>

/**
 * Constrain a props object `T` against its expected shape `U`, with event-handler
 * keys typed from `U` rather than inferred from `T`.
 *
 * `U` is the already-resolved props type for the inferred animated state (e.g.
 * `UseSpringProps<NoInfer<Props>>`). Event handlers (`onChange` and friends) live
 * inside the same object literal that the hook's `Props` generic is inferred from,
 * so TypeScript cannot contextually type their callbacks from the still-inferring
 * generic and degrades the argument to `any`. Sourcing those keys from `U` — which
 * the caller wraps in `NoInfer` so they no longer drive inference — lets the state
 * resolve first, so per-key handlers get the key's value type. See #2541.
 *
 * Non-event keys keep their inferred types and are still typo-checked via `Valid`,
 * applied as a `NoInfer` layer so it stays inference-neutral.
 *
 * The `Omit<Loose, EventKey>` arm preserves the loose escape hatch the hooks
 * previously got from a bare `| UseSpringProps`-style union member: a
 * `Props`-independent shape (pass the hook's non-generic props type as `Loose`)
 * that still accepts pre-typed/untyped values such as a `ref` from `SpringRef()`,
 * and keeps `Parameters<typeof hook>` extraction usable. It omits the event keys
 * so it never supplies a competing — and leaky — contextual type for the callbacks.
 */
export type EventfulProps<
  T extends object,
  U extends object,
  Loose extends object = U,
> =
  | ({ [K in keyof T]: K extends EventKey & keyof U ? U[K] : T[K] } & NoInfer<
      Valid<Omit<T, EventKey>, U>
    >)
  | Omit<Loose, EventKey>

/** Replace the type of each `P` property with `never` */
type NeverProps<T, P extends keyof T> = Remap<
  Pick<T, Exclude<keyof T, P>> & { [K in P]: never }
>

/** Return a union type of every key whose `T` value is incompatible with its `U` value */
type InvalidKeys<T, U> = {
  [P in keyof T & keyof U]: T[P] extends U[P] ? never : P
}[keyof T & keyof U]

/** Unwrap any `FluidValue` object types */
export type RawValues<T extends object> = {
  [P in keyof T]: T[P] extends FluidValue<infer U> ? U : T[P]
}

/**
 * For testing whether a type is an object but not an array.
 *
 *     T extends IsPlainObject<T> ? true : false
 *
 * When `any` is passed, the resolved type is `true | false`.
 */
export type IsPlainObject<T> =
  T extends ReadonlyArray<any> ? Any : T extends object ? object : Any

export type StringKeys<T> =
  T extends IsPlainObject<T> ? string & keyof T : string
