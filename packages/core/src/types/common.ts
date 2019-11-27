import {
  ObjectType,
  UnknownProps,
  ObjectFromUnion,
  FluidValue,
  Constrain,
} from 'shared'

export * from 'shared/types/common'

/** Map the `T` object type and replace any properties that cannot be assigned to `U` with `never` */
export type Valid<T extends object, U extends object> = {
  [P in keyof T & keyof U]: T[P] extends U[P] ? U[P] : never
}

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
              : T extends ((...args: any[]) => infer Return)
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
  onAnimate?: any
  onStart?: any
  onChange?: any
  onRest?: any
}
