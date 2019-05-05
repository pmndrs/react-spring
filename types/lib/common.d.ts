import {
  ComponentPropsWithRef,
  ForwardRefExoticComponent,
  ElementType,
  CSSProperties,
} from 'react'

/** Spring presets */
export const config: {
  /** default: { tension: 170, friction: 26 } */
  default: SpringConfig
  /** gentle: { tension: 120, friction: 14 } */
  gentle: SpringConfig
  /** wobbly: { tension: 180, friction: 12 } */
  wobbly: SpringConfig
  /** stiff: { tension: 210, friction: 20 } */
  stiff: SpringConfig
  /** slow: { tension: 280, friction: 60 } */
  slow: SpringConfig
  /** molasses: { tension: 280, friction: 120 } */
  molasses: SpringConfig
}

/** Spring animation config */
export interface SpringConfig {
  mass?: number
  tension?: number
  friction?: number
  velocity?: number
  clamp?: boolean
  precision?: number
  delay?: number
  decay?: number | boolean
  duration?: number
  easing?: SpringEasingFunc
}

/** Time-based interpolation */
export type SpringEasingFunc = (t: number) => number

/**
 * Animation-related props
 */
export interface AnimationProps extends AnimationEvents {
  /**
   * Configure the spring behavior for each key.
   */
  config?: SpringConfig | ((key: string) => SpringConfig)
  /**
   * Milliseconds to wait before applying the other props.
   */
  delay?: number
  /**
   * When true, props jump to their goal values instead of animating.
   */
  immediate?: boolean | ((key: string) => boolean)
  /**
   * Start the next animations at their values in the `from` prop.
   */
  reset?: boolean
  /**
   * Swap the `to` and `from` props.
   */
  reverse?: boolean
}

export interface AnimationEvents<T extends object = {}> {
  /**
   * Called when an animation is about to start
   */
  onStart?: (animation: any) => void
  /**
   * Called when all animations come to a stand-still
   */
  onRest?: (restValues: Readonly<AnimationFrame<T>>) => void
  /**
   * Called on every frame when animations are active
   */
  onFrame?: (currentValues: Readonly<AnimationFrame<T>>) => void
}

/** The current values in a specific frame */
export type AnimationFrame<T extends object> = Remap<
  UnknownProps & ({} extends PickAnimated<T> ? unknown : PickAnimated<T>)
>

/** For solving generic types */
export type Solve<T> = T

/** For resolving object intersections */
export type Remap<T> = Solve<{ [P in keyof T]: T[P] }>

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

/** Override the property types of `A` with `B` and merge any new properties */
export type Merge<A, B> = Solve<
  { [K in keyof A]: K extends keyof B ? B[K] : A[K] } & B
>

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

/** Return the keys of `T` with values that are assignable to `U` */
export type AssignableKeys<T, U> = T extends object
  ? U extends object
    ? {
        [P in Extract<keyof T, keyof U>]: T[P] extends U[P] ? P : never
      }[Extract<keyof T, keyof U>]
    : never
  : never

/** Ensure each type of `T` is an array */
export type Arrify<T> = T extends ReadonlyArray<any> ? T : Readonly<[T]>

export type OneOrMore<T> = T | ReadonlyArray<T>
