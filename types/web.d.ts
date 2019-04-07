import { CSSProperties, RefObject } from 'react'
import {
  SpringConfig,
  SpringBaseProps,
  TransitionKeyProps,
  State,
} from './renderprops-universal'
export { SpringConfig, SpringBaseProps, TransitionKeyProps, State }

export { config, interpolate } from './renderprops-universal'
// hooks are currently web-only
export { animated } from './renderprops'

/** List from `function getForwardProps` in `src/shared/helpers` */
type ExcludedProps =
  | 'to'
  | 'from'
  | 'config'
  | 'onStart'
  | 'onRest'
  | 'onFrame'
  | 'children'
  | 'reset'
  | 'reverse'
  | 'force'
  | 'immediate'
  | 'delay'
  | 'attach'
  | 'destroyed'
  | 'interpolateTo'
  | 'ref'
  | 'lazy'

// The config options for an interoplation. It maps out from in "in" type
// to an "out" type.
export type InterpolationConfig<T, U = T> = {
  range: T[]
  output: U[]
}

// The InterpolationChain is either a function that takes a config object
// and returns the next chainable type or it is a function that takes in params
// and maps out to another InterpolationChain.
export interface InterpolationChain<T> {
  <U>(config: InterpolationConfig<T, U>): OpaqueInterpolation<U>
  <U>(interpolator: (params: T) => U): OpaqueInterpolation<U>
}

// The opaque interpolation masks as its original type but provides to helpers
// for chaining the interpolate method and getting its raw value.
export type OpaqueInterpolation<T> = {
  interpolate: InterpolationChain<T>
  getValue: () => T
} & T

// Map all keys to our OpaqueInterpolation type which can either be interpreted
// as its initial value by "animated.{tag}" or chained with interpolations.
export type AnimatedValue<T extends object> = {
  [P in keyof T]: OpaqueInterpolation<T[P]>
}

// Make ForwardedProps chainable with interpolate / make it an animated value.
export type ForwardedProps<T> = Pick<T, Exclude<keyof T, ExcludedProps>>

// NOTE: because of the Partial, this makes a weak type, which can have excess props
type InferFrom<T extends object> = T extends { to: infer TTo }
  ? Partial<TTo>
  : Partial<ForwardedProps<T>>

// This is similar to "Omit<A, keyof B> & B",
//  but with a delayed evaluation that still allows A to be inferrable
type Merge<A, B> = { [K in keyof A]: K extends keyof B ? B[K] : A[K] } & B

export type SetUpdateFn<DS extends object> = (ds: Partial<UseSpringProps<DS>>) => void
export interface SetUpdateCallbackFn<DS extends object> {
  (ds: Partial<UseSpringProps<DS>>): void;
  (i: number): Partial<UseSpringProps<DS>>;
}

// The hooks do emulate React's 'ref' by accepting { ref?: React.RefObject<Controller> } and
// updating it. However, there are no types for Controller, and I assume it is intentionally so.
// This is a partial interface for Controller that has only the properties needed for useChain to work.
export interface ReactSpringHook {
  start(): void
  stop(): void
}

export function useChain(refs: ReadonlyArray<RefObject<ReactSpringHook>>): void
// this looks like it can just be a single overload, but we don't want to allow
// timeFrame to be specifiable when timeSteps is explicitly "undefined"
export function useChain(
  refs: ReadonlyArray<RefObject<ReactSpringHook>>,
  timeSteps: number[],
  timeFrame?: number
): void

export interface HooksBaseProps
  extends Pick<SpringBaseProps, Exclude<keyof SpringBaseProps, 'config'>> {
  /**
   * Will skip rendering the component if true and write to the dom directly.
   * @default true
   * @deprecated
   */
  native?: never
  // there is an undocumented onKeyframesHalt which passes the controller instance,
  // so it also cannot be typed unless Controller types are written
  ref?: React.RefObject<ReactSpringHook>
}

export interface UseSpringBaseProps extends HooksBaseProps {
  config?: SpringBaseProps['config']
}

export type UseSpringProps<DS extends object> = Merge<
  DS & UseSpringBaseProps,
  {
    from?: InferFrom<DS>
    /**
     * Callback when the animation comes to a still-stand
     */
    onRest?(ds: InferFrom<DS>): void
  }
>

type OverwriteKeys<A, B> = { [K in keyof A]: K extends keyof B ? B[K] : A[K] };

// there's a third value in the tuple but it's not public API (?)
export function useSpring<DS extends object>(
  values: UseSpringProps<Merge<DS, CSSProperties>>
): AnimatedValue<ForwardedProps<OverwriteKeys<DS, CSSProperties>>>
export function useSpring<DS extends object>(
  getProps: () => UseSpringProps<Merge<DS, CSSProperties>>
): [AnimatedValue<ForwardedProps<OverwriteKeys<DS, CSSProperties>>>, SetUpdateFn<OverwriteKeys<DS, CSSProperties>>]

// there's a third value in the tuple but it's not public API (?)
export function useSprings<TItem, DS extends CSSProperties>(
  count: number,
  items: ReadonlyArray<TItem>,
): ForwardedProps<DS>[] // safe to modify (result of .map)
export function useSprings<DS extends object>(
  count: number,
  getProps: (i: number) => UseSpringProps<DS>
): [AnimatedValue<ForwardedProps<DS>>[], SetUpdateCallbackFn<DS>]

// there's a third value in the tuple but it's not public API (?)
export function useTrail<DS extends CSSProperties>(
  count: number,
  getProps: () => UseSpringProps<DS & CSSProperties>
): [ForwardedProps<DS>[], SetUpdateFn<DS>]
export function useTrail<DS extends CSSProperties>(
  count: number,
  values: UseSpringProps<DS & CSSProperties>
): ForwardedProps<DS>[] // safe to modify (result of .map)
export function useTrail<DS extends object>(
  count: number,
  getProps: () => UseSpringProps<DS>
): [AnimatedValue<ForwardedProps<DS>>[], SetUpdateFn<DS>]
export function useTrail<DS extends object>(
  count: number,
  values: UseSpringProps<DS>
): AnimatedValue<ForwardedProps<DS>>[] // safe to modify (result of .map)

export interface UseTransitionProps<TItem, DS extends object>
  extends HooksBaseProps {
  /**
   * Spring config, or for individual items: fn(item => config)
   * @default config.default
   */
  config?: SpringConfig | ((item: TItem) => SpringConfig)

  /**
   * When true enforces that an item can only occur once instead of allowing two or more items with the same key to co-exist in a stack
   * @default false
   */
  unique?: boolean
  /**
   * Trailing delay in ms
   */
  trail?: number

  from?: InferFrom<DS> | ((item: TItem) => InferFrom<DS>)
  /**
   * Values that apply to new elements, or: item => values
   * @default {}
   */
  enter?: InferFrom<DS> | InferFrom<DS>[] | ((item: TItem) => InferFrom<DS>)
  /**
   * Values that apply to leaving elements, or: item => values
   * @default {}
   */
  leave?: InferFrom<DS> | InferFrom<DS>[] | ((item: TItem) => InferFrom<DS>)
  /**
   * Values that apply to elements that are neither entering nor leaving (you can use this to update present elements), or: item => values
   */
  update?: InferFrom<DS> | InferFrom<DS>[] | ((item: TItem) => InferFrom<DS>)                           
  /**
   * Initial (first time) base values, optional (can be null)
   */
  initial?: InferFrom<DS> | ((item: TItem) => InferFrom<DS>) | null
  /**
   * Called when objects have disappeared for good
   */
  onDestroyed?: (isDestroyed: boolean) => void
}

export interface UseTransitionResult<TItem, DS extends object> {
  item: TItem
  key: string
  state: State
  props: AnimatedValue<ForwardedProps<DS>>
}

export function useTransition<TItem, DS extends CSSProperties>(
  items: ReadonlyArray<TItem> | TItem | null | undefined,
  keys:
    | ((item: TItem) => TransitionKeyProps)
    | ReadonlyArray<TransitionKeyProps>
    | TransitionKeyProps
    | null,
  values: Merge<DS & CSSProperties, UseTransitionProps<TItem, DS>>
): UseTransitionResult<TItem, ForwardedProps<DS>>[] // result array is safe to modify
export function useTransition<TItem, DS extends object>(
  items: ReadonlyArray<TItem> | TItem | null | undefined,
  keys:
    | ((item: TItem) => TransitionKeyProps)
    | ReadonlyArray<TransitionKeyProps>
    | TransitionKeyProps           
    | null,
  values: Merge<DS, UseTransitionProps<TItem, DS>>
): UseTransitionResult<TItem, AnimatedValue<ForwardedProps<DS>>>[] // result array is safe to modify
