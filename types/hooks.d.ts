import {
  SpringConfig,
  SpringBaseProps,
  TransitionKeyProps,
  State,
} from './universal'
export { SpringConfig, SpringBaseProps, TransitionKeyProps, State }

/** List from `function getForwardProps` in `src/shared/helpers` */
type ExcludedProps =
  | 'to'
  | 'from'
  | 'config'
  | 'native'
  | 'onStart'
  | 'onRest'
  | 'onFrame'
  | 'children'
  | 'reset'
  | 'reverse'
  | 'force'
  | 'immediate'
  | 'impl'
  | 'inject'
  | 'delay'
  | 'attach'
  | 'destroyed'
  | 'track'
  | 'interpolateTo'
  | 'autoStart'
  | 'ref'

export type InterpolationOptions<T, U = T> = {
  range: T[]
  output: U[]
}

export interface InterpolationFn<T> {
  <U>(options: InterpolationOptions<T, U>): OpaqueInterpolation<U> & U & string
  (interpolator: (params: T) => string): OpaqueInterpolation<T> & T & string
}

export type OpaqueInterpolation<T> = {
  interpolate: InterpolationFn<T>
  getValue: () => T
}

export type AnimatedValue<T extends object> = {
  [P in keyof T]: OpaqueInterpolation<T[P]> & string
}

export type ForwardedProps<T> = AnimatedValue<
  Pick<T, Exclude<keyof T, ExcludedProps>>
>
// NOTE: because of the Partial, this makes a weak type, which can have excess props
type InferFrom<T extends object> = T extends { to: infer TTo }
  ? Partial<TTo>
  : Partial<ForwardedProps<T>>

// This is similar to "Omit<A, keyof B> & B",
//  but with a delayed evaluation that still allows A to be inferrable
type Merge<A, B> = { [K in keyof A]: K extends keyof B ? B[K] : A[K] } & B

export type SetUpdateFn<DS extends object> = (ds: DS) => void

// The hooks do emulate React's 'ref' by accepting { ref?: React.RefObject<Controller> } and
// updating it. However, there are no types for Controller, and I assume it is intentionally so.
export interface HooksBaseProps
  extends Pick<SpringBaseProps, Exclude<keyof SpringBaseProps, 'config'>> {
  // there is an undocumented onKeyframesHalt which passes the controller instance,
  // so it also cannot be typed unless Controller types are written
}

export interface UseSpringBaseProps extends HooksBaseProps {
  config?: SpringBaseProps['config']
}

export type UseSpringProps<DS extends UseSpringBaseProps> = Merge<
  DS,
  {
    from?: InferFrom<DS>
    /**
     * Callback when the animation comes to a still-stand
     */
    onRest?(ds: InferFrom<DS>): void
  }
>

// there's a third value in the tuple but it's not public API (?)
export function useSpring<DS extends object>(
  getProps: () => UseSpringProps<DS>
): [ForwardedProps<DS>, SetUpdateFn<DS>]
export function useSpring<DS extends object>(
  values: UseSpringProps<DS>
): ForwardedProps<DS>

// there's a third value in the tuple but it's not public API (?)
export function useTrail<DS extends object>(
  count: number,
  getProps: () => UseSpringProps<DS>
): [ForwardedProps<DS>[], SetUpdateFn<DS>]
export function useTrail<DS extends object>(
  count: number,
  values: UseSpringProps<DS>
): ForwardedProps<DS>[] // safe to modify (result of .map)

export interface UseTransitionProps<TItem, DS extends object>
  extends HooksBaseProps {
  items: ReadonlyArray<TItem> | null | undefined
  /**
   * Spring config, or for individual items: fn(item => config)
   * @default config.default
   */
  config?: SpringConfig | ((item: TItem) => SpringConfig)
  /**
   * The same keys you would normally hand over to React in a list. Keys can be specified as a key-accessor function, an array of keys, or a single value
   */
  keys?:
    | ((item: TItem) => TransitionKeyProps)
    | ReadonlyArray<TransitionKeyProps>
    | TransitionKeyProps

  /**
   * When true enforces that an item can only occur once instead of allowing two or more items with the same key to co-exist in a stack
   * @default false
   */
  unique?: boolean
  /**
   * Trailing delay in ms
   */
  trail?: number

  from?: InferFrom<DS>
  /**
   * Values that apply to new elements, or: item => values
   * @default {}
   */
  enter?: InferFrom<DS> | ((item: TItem) => InferFrom<DS>)
  /**
   * Values that apply to leaving elements, or: item => values
   * @default {}
   */
  leave?: InferFrom<DS> | ((item: TItem) => InferFrom<DS>)
  /**
   * Values that apply to elements that are neither entering nor leaving (you can use this to update present elements), or: item => values
   */
  update?: InferFrom<DS> | ((item: TItem) => InferFrom<DS>)
}

export interface UseTransitionResult<TItem, DS extends object> {
  item: TItem
  key: string
  state: State
  props: ForwardedProps<DS>
}

export function useTransition<TItem, DS extends object>(
  values: Merge<DS, UseTransitionProps<TItem, DS>>
): UseTransitionResult<TItem, ForwardedProps<DS>>[] // result array is safe to modify

// higher order hooks 🤯
export namespace useKeyframes {
  // this kind of higher order hook requires higher kinded types to type correctly at all
  // this is the best approximation I can get to....... and there sure are anys around 🤯

  // the docs says it receives a 3rd argument with the component's own props, but it's only
  // ever called with two (https://github.com/react-spring/react-spring/blob/v7.1.3/src/hooks/KeyframesHook.js#L25)
  export type KeyframeFn<DS extends object> = (
    next: (props: UseSpringProps<DS>) => Promise<void>,
    cancel: () => void
  ) => Promise<void>
  export interface SpringKeyframeSlotsConfig extends HooksBaseProps {
    // this is way too self-referential to type correctly
    // both onRest and config have to have vague types... 😭

    /**
     * Callback when the animation comes to a still-stand
     */
    onRest?(ds: any): void
    config?:
      | SpringConfig
      | ReadonlyArray<SpringConfig>
      | ((slot: string) => SpringConfig | ReadonlyArray<SpringConfig>)
  }
  export interface TrailKeyframeSlotsConfig<TItem>
    extends SpringKeyframeSlotsConfig {
    items: ReadonlyArray<TItem>
  }

  export type ResolveKeyframeSlotValue<T> = T extends KeyframeFn<infer V>
    ? V
    : T extends ReadonlyArray<infer U>
    ? U extends KeyframeFn<infer V>
      ? V
      : U extends Function // guard against accidentally putting in a KeyframeFn function
      ? never
      : U
    : T extends Function // same guard, but when the function is not in an array
    ? never
    : T

  // fun fact: the state is literally named "undefined" if you're using this overload
  // the docs are vague but it seems this just loops the one animation forever?
  export function spring<DS extends object>(
    animation:
      | ReadonlyArray<DS>
      | ReadonlyArray<KeyframeFn<DS>>
      | KeyframeFn<DS>,
    initialProps?: UseSpringProps<DS>
  ): UseSpringKeyframes<DS>
  // unfortunately, it's not possible to infer the type of the callback functions (if any are given)
  // while also remaining possible to infer the slot names. Callback functions have to be cast with
  // `as useKeyframes.KeyframeFn<{ ... }>`.
  // it's also not possible to specify the types of the values inside TSlots. This is a mess.
  export function spring<TSlots extends object>(
    slots: TSlots & SpringKeyframeSlotsConfig,
    // also unfortunately not possible to strongly type this either
    initialProps?: UseSpringProps<any>
  ): UseSpringKeyframesWithSlots<TSlots>

  export function trail<DS extends object>(
    animation:
      | ReadonlyArray<DS>
      | ReadonlyArray<KeyframeFn<DS>>
      | KeyframeFn<DS>,
    initialProps?: UseSpringProps<DS>
  ): UseTrailKeyframes<DS>
  export function trail<TItem, TSlots extends object>(
    slots: TSlots & TrailKeyframeSlotsConfig<TItem>,
    initialProps?: UseSpringProps<any>
  ): UseTrailKeyframesWithSlots<TSlots>

  export type UseSpringKeyframesWithSlots<TSlots extends object> =
    // there's a bug in the implementation that actually should cause a crash
    // because there is no second argument, but because it is built with babel on loose mode,
    // it doesn't...
    <TSlot extends Exclude<keyof TSlots, keyof SpringKeyframeSlotsConfig>>(
      slot: TSlot
    ) => ForwardedProps<ResolveKeyframeSlotValue<TSlots[TSlot]>>
  // this one crashes "even more" because both values are undefined
  export type UseSpringKeyframes<DS extends object> = () => ForwardedProps<DS>

  export type UseTrailKeyframesWithSlots<TSlots extends object> = <
    TSlot extends Exclude<keyof TSlots, keyof TrailKeyframeSlotsConfig<any>>
  >(
    count: number,
    slot: TSlot
  ) => ForwardedProps<ResolveKeyframeSlotValue<TSlots[TSlot]>>[]

  export type UseTrailKeyframes<DS extends object> = (
    count: number
  ) => ForwardedProps<DS>[]
}
