import { ObjectType, UnknownProps, ObjectFromUnion, Falsy } from 'shared'

export * from 'shared/types/common'

export type Tween<From, To> = (From extends Falsy ? {} : ObjectType<From>) &
  (To extends Falsy | Function | ReadonlyArray<any> ? {} : ObjectType<To>)

/** The phases of a `useTransition` item */
export type TransitionPhase = 'initial' | 'enter' | 'update' | 'leave'

/**
 * Pick the properties of these object props...
 *
 *     "to", "from", "initial", "enter", "update", "leave"
 *
 * ...as well as any forward props.
 */
export type PickAnimated<
  Props extends object,
  AndForward = true
> = ObjectFromUnion<
  | FromValues<Props>
  | (TransitionPhase & keyof Props extends never
      ?
          | ToValues<Props>
          | (AndForward extends true ? ForwardProps<Props> : never)
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
export type ToValues<Props extends object> = Props extends { to?: infer To }
  ? ForwardProps<
      To extends ReadonlyArray<infer T> | ((...args: any[]) => infer T)
        ? ObjectType<T>
        : ObjectType<To>
    >
  : never

/**
 * Pick the values of the `from` prop.
 */
export type FromValues<Props extends object> = ForwardProps<
  Props extends { from?: infer From } ? ObjectType<From> : object
>

/**
 * Extract a union of animated values from a set of `useTransition` props.
 */
type TransitionValues<Props extends object> = ForwardProps<
  ObjectFromUnion<ObjectType<Props[TransitionPhase & keyof Props]>>
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
  onFrame?: any
}
