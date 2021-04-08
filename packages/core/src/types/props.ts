import { FluidProps, FluidValue } from '@react-spring/shared'
import {
  Any,
  Constrain,
  Lookup,
  Falsy,
  Merge,
  ObjectFromUnion,
  ObjectType,
  OneOrMore,
  Remap,
  UnknownProps,
} from '@react-spring/types'

import { Controller } from '../Controller'
import { SpringRef } from '../SpringRef'
import { SpringValue } from '../SpringValue'
import { SpringConfig } from './objects'
import { StringKeys, RawValues, IsPlainObject } from './common'
import { TransitionKey, TransitionValues } from './transition'
import {
  SpringToFn,
  OnChange,
  OnRest,
  OnStart,
  OnProps,
  OnPause,
  OnResume,
  OnResolve,
} from './functions'

/**
 * Move all non-reserved props into the `to` prop.
 */
export type InferTo<T extends object> = Merge<
  { to: ForwardProps<T> },
  Pick<T, keyof T & keyof ReservedProps>
>

/**
 * The props of a `useSpring` call or its async `update` function.
 *
 * The `T` parameter can be a set of animated values (as an object type)
 * or a primitive type for a single animated value.
 */
export type SpringUpdate<T = any> = ToProps<T> & SpringProps<T>

export type SpringsUpdate<State extends Lookup = UnknownProps> =
  | OneOrMore<ControllerUpdate<State>>
  | ((index: number, ctrl: Controller<State>) => ControllerUpdate<State> | null)

/**
 * Use the `SpringUpdate` type if you need the `to` prop to exist.
 * For function types, prefer one overload per possible `to` prop
 * type (for better type inference).
 *
 * The `T` parameter can be a set of animated values (as an object type)
 * or a primitive type for a single animated value.
 */
export interface SpringProps<T = any> extends AnimationProps<T> {
  from?: GoalValue<T>
  // FIXME: Use "SpringUpdate<T>" once type recursion is good enough.
  loop?: LoopProp<SpringUpdate>
  /**
   * Called after an animation is updated by new props,
   * even if the animation remains idle.
   */
  onProps?: EventProp<OnProps<T>>
  /**
   * Called when an animation moves for the first time.
   */
  onStart?: EventProp<OnStart<SpringValue<T>, SpringValue<T>>>
  /**
   * Called when a spring has its value changed.
   */
  onChange?: EventProp<OnChange<SpringValue<T>, SpringValue<T>>>
  onPause?: EventProp<OnPause<SpringValue<T>, SpringValue<T>>>
  onResume?: EventProp<OnResume<SpringValue<T>, SpringValue<T>>>
  /**
   * Called when all animations come to a stand-still.
   */
  onRest?: EventProp<OnRest<SpringValue<T>, SpringValue<T>>>
}

/**
 * A union type of all possible `to` prop values.
 *
 * This is not recommended for function types. Instead, you should declare
 * an overload for each `to` type. See `SpringUpdateFn` for an example.
 *
 * The `T` parameter can be a set of animated values (as an object type)
 * or a primitive type for a single animated value.
 */
export type ToProps<T = any> =
  | { to?: GoalProp<T> | SpringToFn<T> | SpringChain<T> }
  | ([T] extends [IsPlainObject<T>] ? InlineToProps<T> : never)

/**
 * A value or set of values that can be animated from/to.
 *
 * The `T` parameter can be a set of animated values (as an object type)
 * or a primitive type for a single animated value.
 */
export type GoalProp<T> = [T] extends [IsPlainObject<T>]
  ? GoalValues<T> | Falsy
  : GoalValue<T>

/** A set of values for a `Controller` to animate from/to. */
export type GoalValues<T extends Lookup> = FluidProps<T> extends infer Props
  ? { [P in keyof Props]?: Props[P] | null }
  : never

/**
 * A value that `SpringValue` objects can animate from/to.
 *
 * The `UnknownProps` type lets you pass in { a: 1 } if the `key`
 * property of `SpringValue` equals "a".
 */
export type GoalValue<T> = T | FluidValue<T> | UnknownProps | null | undefined

/**
 * Where `to` is inferred from non-reserved props
 *
 * The `T` parameter can be a set of animated values (as an object type)
 * or a primitive type for a single animated value.
 */
export type InlineToProps<T = any> = Remap<GoalValues<T> & { to?: undefined }>

/** A serial queue of spring updates. */
export interface SpringChain<T = any>
  extends Array<
    [T] extends [IsPlainObject<T>]
      ? ControllerUpdate<T>
      : SpringTo<T> | SpringUpdate<T>
  > {}

/** A value that any `SpringValue` or `Controller` can animate to. */
export type SpringTo<T = any> =
  | ([T] extends [IsPlainObject<T>] ? never : T | FluidValue<T>)
  | SpringChain<T>
  | SpringToFn<T>
  | Falsy

export type ControllerUpdate<
  State extends Lookup = Lookup,
  Item = undefined
> = unknown & ToProps<State> & ControllerProps<State, Item>

/**
 * Props for `Controller` methods and constructor.
 */
export interface ControllerProps<
  State extends Lookup = Lookup,
  Item = undefined
> extends AnimationProps<State> {
  ref?: SpringRef<State>
  from?: GoalValues<State> | Falsy
  // FIXME: Use "ControllerUpdate<T>" once type recursion is good enough.
  loop?: LoopProp<ControllerUpdate>
  /**
   * Called when the # of animating values exceeds 0
   *
   * Also accepts an object for per-key events
   */
  onStart?:
    | OnStart<SpringValue<State>, Controller<State>, Item>
    | {
        [P in keyof State]?: OnStart<
          SpringValue<State[P]>,
          Controller<State>,
          Item
        >
      }
  /**
   * Called when the # of animating values hits 0
   *
   * Also accepts an object for per-key events
   */
  onRest?:
    | OnRest<SpringValue<State>, Controller<State>, Item>
    | {
        [P in keyof State]?: OnRest<
          SpringValue<State[P]>,
          Controller<State>,
          Item
        >
      }
  /**
   * Called once per frame when animations are active
   *
   * Also accepts an object for per-key events
   */
  onChange?:
    | OnChange<SpringValue<State>, Controller<State>, Item>
    | {
        [P in keyof State]?: OnChange<
          SpringValue<State[P]>,
          Controller<State>,
          Item
        >
      }

  onPause?:
    | OnPause<SpringValue<State>, Controller<State>, Item>
    | {
        [P in keyof State]?: OnPause<
          SpringValue<State[P]>,
          Controller<State>,
          Item
        >
      }
  onResume?:
    | OnResume<SpringValue<State>, Controller<State>, Item>
    | {
        [P in keyof State]?: OnResume<
          SpringValue<State[P]>,
          Controller<State>,
          Item
        >
      }
  /**
   * Called after an animation is updated by new props.
   * Useful for manipulation
   *
   * Also accepts an object for per-key events
   */
  onProps?: OnProps<State> | { [P in keyof State]?: OnProps<State[P]> }
  /**
   * Called when the promise for this update is resolved.
   */
  onResolve?: OnResolve<SpringValue<State>, Controller<State>, Item>
}

export type LoopProp<T extends object> = boolean | T | (() => boolean | T)

export type VelocityProp<T = any> = T extends ReadonlyArray<number | string>
  ? number[]
  : number

/** For props that can be set on a per-key basis. */
export type MatchProp<T> =
  | boolean
  | OneOrMore<StringKeys<T>>
  | ((key: StringKeys<T>) => boolean)

/** Event props can be customized per-key. */
export type EventProp<T> = T | Lookup<T | undefined>

/**
 * Most of the reserved animation props, except `to`, `from`, `loop`,
 * and the event props.
 */
export interface AnimationProps<T = any> {
  /**
   * Configure the spring behavior for each key.
   */
  config?: SpringConfig | ((key: StringKeys<T>) => SpringConfig)
  /**
   * Milliseconds to wait before applying the other props.
   */
  delay?: number | ((key: StringKeys<T>) => number)
  /**
   * When true, props jump to their goal values instead of animating.
   */
  immediate?: MatchProp<T>
  /**
   * Cancel all animations by using `true`, or some animations by using a key
   * or an array of keys.
   */
  cancel?: MatchProp<T>
  /**
   * Pause all animations by using `true`, or some animations by using a key
   * or an array of keys.
   */
  pause?: MatchProp<T>
  /**
   * Start the next animations at their values in the `from` prop.
   */
  reset?: MatchProp<T>
  /**
   * Swap the `to` and `from` props.
   */
  reverse?: boolean
  /**
   * Override the default props with this update.
   */
  default?: boolean | SpringProps<T>
}

/**
 * Extract the custom props that are treated like `to` values
 */
export type ForwardProps<T extends object> = RawValues<
  Omit<Constrain<T, {}>, keyof ReservedProps>
>

/**
 * Property names that are reserved for animation config
 */
export interface ReservedProps extends ReservedEventProps {
  config?: any
  from?: any
  to?: any
  ref?: any
  loop?: any
  pause?: any
  reset?: any
  cancel?: any
  reverse?: any
  immediate?: any
  default?: any
  delay?: any

  // Transition props
  items?: any
  trail?: any
  sort?: any
  expires?: any
  initial?: any
  enter?: any
  update?: any
  leave?: any
  children?: any

  // Internal props
  keys?: any
  callId?: any
  parentId?: any
}

export interface ReservedEventProps {
  onProps?: any
  onStart?: any
  onChange?: any
  onPause?: any
  onResume?: any
  onRest?: any
  onResolve?: any
  onDestroyed?: any
}

/**
 * Pick the properties of these object props...
 *
 *     "to", "from", "initial", "enter", "update", "leave"
 *
 * ...as well as any forward props.
 */
export type PickAnimated<Props extends object, Fwd = true> = unknown &
  ([Props] extends [Any]
    ? Lookup // Preserve "any" instead of resolving to "{}"
    : [object] extends [Props]
    ? Lookup
    : ObjectFromUnion<
        Props extends { from: infer From } // extract prop from the `from` prop if it exists
          ? ObjectType<From>
          : TransitionKey & keyof Props extends never
          ? ToValues<Props, Fwd>
          : TransitionValues<Props>
      >)

/**
 * Pick the values of the `to` prop. Forward props are *not* included.
 */
type ToValues<Props extends object, AndForward = true> = unknown &
  (AndForward extends true ? ForwardProps<Props> : unknown) &
  (Props extends { to?: any }
    ? Exclude<Props['to'], Function | ReadonlyArray<any>> extends infer To
      ? ForwardProps<[To] extends [object] ? To : Partial<Extract<To, object>>>
      : never
    : unknown)
