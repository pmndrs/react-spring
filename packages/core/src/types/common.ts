import { ObjectType, UnknownProps, ObjectFromUnion } from 'shared'

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
export type TransitionValues<Props extends object> = ForwardProps<
  ObjectFromUnion<
    ObjectType<
      Props[TransitionPhase & keyof Props] extends infer T
        ? T extends ReadonlyArray<infer U>
          ? U
          : T extends ((...args: any[]) => infer U)
          ? U extends ReadonlyArray<infer T>
            ? T
            : U
          : T
        : never
    >
  >
>

/**
 * Extract the custom props that are treated like `to` values
 */
export type ForwardProps<T extends object> = Omit<T, keyof ReservedProps>

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
  onRest?: any
  onChange?: any
  onFrame?: any
}
