import { Remap } from 'shared'

export * from 'shared/types/common'

/** Extract string keys from an object type */
export type StringKeys<T extends object> = Extract<keyof T, string>

/** Intersected with other object types to allow for unknown properties */
export type UnknownProps = { [key: string]: unknown }

/** Infer an object type from an object, array, or function type */
type InferObject<T> = T extends
  | ReadonlyArray<infer U>
  | ((...args: any[]) => infer U)
  ? (U extends object ? U : {})
  : (T extends object ? T : {})

/** Extract a union of animated props from a `useTransition` config */
type TransitionValues<T extends object> = TransitionPhase extends infer Phase
  ? Phase extends keyof T
    ? NoVoid<InferObject<T[Phase]>>
    : {}
  : never

/** The phases of a `useTransition` item */
export type TransitionPhase = 'initial' | 'enter' | 'update' | 'leave'

/** String union of the transition phases defined in `T` */
export type TransitionPhases<T extends object> = {
  [P in TransitionPhase]: P extends keyof T ? P : never
}[TransitionPhase]

// Ensure properties are never undefined.
type NoVoid<T extends object> = {
  [P in keyof T]-?: T[P] extends void ? never : T[P]
}

/** Pick the properties that will be animated */
export type PickAnimated<T extends object> = ObjectFromUnion<
  | (T extends { from: infer FromProp } ? NoVoid<InferObject<FromProp>> : {})
  | (TransitionPhases<T> extends never ? ToValues<T> : TransitionValues<T>)
>

/** Extract `to` values from a `useSpring` config */
type ToValues<T extends object> = T extends { to: infer ToProp }
  ? ToProp extends Function
    ? {}
    : ToProp extends ReadonlyArray<infer U>
    ? (U extends object ? U : {})
    : (ToProp extends object ? ToProp : {})
  : ForwardProps<T>

/** Intersect a union of objects but merge property types with _unions_ */
export type ObjectFromUnion<T extends object> = Remap<
  {
    [P in keyof Intersect<T>]: T extends infer U
      ? P extends keyof U
        ? U[P]
        : never
      : never
  }
>

/** Convert a union to an intersection */
type Intersect<U> = (U extends any ? (k: U) => void : never) extends ((
  k: infer I
) => void)
  ? I
  : never

/**
 * Extract the custom props that are treated like `to` values
 */
export type ForwardProps<T extends object> = keyof T extends ReservedProps
  ? {}
  : Pick<T, Exclude<keyof T, ReservedProps>>

/**
 * Property names that are reserved for animation config
 */
export type ReservedProps =
  | 'children'
  | 'config'
  | 'from'
  | 'to'
  | 'ref'
  | 'reset'
  | 'cancel'
  | 'reverse'
  | 'immediate'
  | 'delay'
  | 'lazy'
  | 'items'
  | 'trail'
  | 'unique'
  | 'initial'
  | 'enter'
  | 'leave'
  | 'update'
  | 'onStart'
  | 'onRest'
  | 'onFrame'
  | 'onDestroyed'
  | 'timestamp'
