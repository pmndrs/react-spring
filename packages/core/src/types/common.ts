import {
  ObjectType,
  UnknownProps,
  ObjectFromUnion,
  FluidValue,
  Constrain,
  Remap,
  Any,
} from 'shared'

export * from 'shared/types/common'

/** Replace the type of each `T` property with `never` (unless compatible with `U`) */
export type Valid<T, U> = NeverProps<T, InvalidKeys<T, U>>

/** Replace the type of each `P` property with `never` */
type NeverProps<T, P extends keyof T> = Remap<
  Pick<T, Exclude<keyof T, P>> & { [K in P]: never }
>

/** Return a union type of every key whose `T` value is incompatible with its `U` value */
type InvalidKeys<T, U> = {
  [P in keyof T & keyof U]: T[P] extends U[P] ? never : P
}[keyof T & keyof U]

/** The phases of a `useTransition` item */
export type TransitionPhase = 'initial' | 'enter' | 'update' | 'leave'

/**
 * Pick the properties of these object props...
 *
 *     "to", "from", "initial", "enter", "update", "leave"
 *
 * ...as well as any forward props.
 */
export type PickAnimated<Props extends object, Fwd = true> = unknown &
  ObjectFromUnion<
    | FromValues<Props>
    | (TransitionPhase & keyof Props extends never
        ? ToValues<Props, Fwd>
        : TransitionValues<Props>)
  >

/**
 * Pick the values that appear in the `onFrame` prop.
 * Forward props are excluded, because of a bug with TypeScript (see here: http://bit.ly/2kaZX8Q)
 */
export type FrameValues<Props extends object> = UnknownProps &
  PickAnimated<Props, false>

/** Unwrap any `FluidValue` object types */
export type RawValues<T extends object> = {
  [P in keyof T]: T[P] extends FluidValue<infer U> ? U : T[P]
}

/**
 * Pick the values of the `to` prop. Forward props are *not* included.
 */
export type ToValues<Props extends object, AndForward = true> = unknown &
  (AndForward extends true ? ForwardProps<Props> : unknown) &
  (Props extends { to?: infer To }
    ? To extends Function
      ? unknown
      : To extends ReadonlyArray<infer T>
      ? T extends object
        ? {
            [P in keyof Props]: PickAnimated<T, AndForward>
          }[keyof Props]
        : unknown
      : ForwardProps<ObjectType<To>>
    : unknown)

/**
 * Pick the values of the `from` prop.
 */
export type FromValues<Props extends object> = ForwardProps<
  Props extends { from?: infer From } ? ObjectType<From> : object
>

/**
 * Extract a union of animated values from a set of `useTransition` props.
 */
export type TransitionValues<Props extends object> = unknown &
  ForwardProps<
    ObjectFromUnion<
      Constrain<
        ObjectType<
          Props[TransitionPhase & keyof Props] extends infer T
            ? T extends ReadonlyArray<infer Element>
              ? Element
              : T extends (...args: any[]) => infer Return
              ? Return extends ReadonlyArray<infer ReturnElement>
                ? ReturnElement
                : Return
              : T
            : never
        >,
        {}
      >
    >
  >

/**
 * Extract the custom props that are treated like `to` values
 */
export type ForwardProps<T extends object> = RawValues<
  Omit<Constrain<T, {}>, keyof ReservedProps>
>

/**
 * Property names that are reserved for animation config
 */
export interface ReservedProps {
  children?: any
  config?: any
  from?: any
  to?: any
  ref?: any
  reset?: any
  cancel?: any
  reverse?: any
  immediate?: any
  default?: any
  delay?: any
  lazy?: any
  items?: any
  trail?: any
  sort?: any
  expires?: any
  initial?: any
  enter?: any
  leave?: any
  update?: any
  onProps?: any
  onStart?: any
  onChange?: any
  onRest?: any
}
