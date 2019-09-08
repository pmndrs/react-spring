import { Remap } from 'shared'

export * from 'shared/types/common'

/** Extract string keys from an object type */
export type StringKeys<T> = T extends object ? Extract<keyof T, string> : string

/** Intersected with other object types to allow for unknown properties */
export type UnknownProps = { [key: string]: unknown }

// https://github.com/microsoft/TypeScript/issues/14829#issuecomment-504042546
export type NoInfer<T> = [T][T extends any ? 0 : never]

/** The phases of a `useTransition` item */
export type TransitionPhase = 'initial' | 'enter' | 'update' | 'leave'

/**
 * Pick the values that appear in the `onFrame` prop.
 * Forward props are excluded, because of a bug with TypeScript (see here: http://bit.ly/2kaZX8Q)
 */
export type FrameValues<Props extends object> = UnknownProps &
  PickAnimated<Props, false>

/**
 * Pick the values of the `to` prop. Forward props are *not* included.
 */
export type ToValues<Props extends object> = ForwardProps<
  Exclude<Props['to' & keyof Props], Function>
>

/**
 * Pick the values of the `from` prop.
 */
export type FromValues<Props extends object> = ForwardProps<
  Props['from' & keyof Props]
>

/**
 * Extract a union of animated values from a set of `useTransition` props.
 */
type TransitionValues<Props extends object> = ForwardProps<
  Props[TransitionPhase & keyof Props]
>

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
  | (keyof Props & TransitionPhase extends never
      ?
          | ToValues<Props>
          | (AndForward extends true ? ForwardProps<Props> : never)
      : TransitionValues<Props>)
>

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
export type ForwardProps<T> = T extends object
  ? Omit<
      T extends ReadonlyArray<infer U> | ((...args: any[]) => infer U) ? U : T,
      keyof ReservedProps
    >
  : never

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
  unique?: any
  initial?: any
  enter?: any
  leave?: any
  update?: any
  onAnimate?: any
  onStart?: any
  onRest?: any
  onFrame?: any
  onDestroyed?: any
  timestamp?: any
  attach?: any
}
