import {
  Component,
  PureComponent,
  ReactNode,
  ComponentClass,
  ComponentType,
  Ref,
} from 'react'

export type SpringEasingFunc = (t: number) => number

export interface SpringConfig {
  mass?: number
  tension?: number
  friction?: number
  velocity?: number
  clamp?: boolean
  precision?: number
  delay?: number
  duration?: number
  easing?: SpringEasingFunc
}

type SpringRendererFunc<DS extends object = {}> = (params: DS) => ReactNode

interface SpringProps<DS extends object = {}> {
  /**
   * Spring config, or for individual keys: fn(key => config)
   * @default config.default
   */
  config?: SpringConfig | ((key: string) => SpringConfig)
  /**
   * Will skip rendering the component if true and write to the dom directly
   * @default false
   */
  native?: boolean
  /**
   * Base styles
   * @default {}
   */
  from?: Partial<DS>
  /**
   * Animates to...
   * @default {}
   */
  to: DS
  /**
   * Callback when the animation starts to animate
   */
  onStart?: () => void
  /**
   * Callback when the animation comes to a still-stand
   */
  onRest?: (ds: DS) => void
  /**
   * Frame by frame callback, first argument passed is the animated value
   */
  onFrame?: () => void
  /**
   * Takes a function that receives interpolated styles
   */
  children?: SpringRendererFunc<DS>
  /**
   * Prevents animation if true, you can also pass individual keys
   * @default false
   */
  immediate?: boolean | string[] | ((key: string) => boolean)
  /**
   * When true it literally resets: from -> to
   * @default false
   */
  reset?: boolean
  /**
   * Inject props
   * @default undefined
   */
  inject?: any
  /**
   * Animation start delay, optional
   */
  delay?: number
}

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

export class Spring<DS extends object> extends PureComponent<SpringProps<DS>> {}

export function interpolate(
  parent: number[],
  config: (...args: number[]) => any
): any

export const animated: {
  <P>(comp: ComponentType<P>): ComponentType<P>
} & {
  [Tag in keyof JSX.IntrinsicElements]: ComponentClass<
    JSX.IntrinsicElements[Tag]
  >
}

type TransitionKeyProps = string | number

interface TransitionProps<
  TItem,
  TInit extends object = {},
  TFrom extends object = {},
  TEnter extends object = {},
  TLeave extends object = {},
  TUpdate extends object = {}
> {
  /**
   * First-render initial values, if present overrides "from" on the first render pass. It can be "null" to skip first mounting transition. Otherwise it can take an object or a function (item => object)
   */
  initial?: TInit | null
  /**
   * Will skip rendering the component if true and write to the dom directly
   * @default false
   */
  native?: boolean
  /**
   * Spring config ({ tension, friction })
   * @default config.default
   */
  config?: SpringConfig | ((key: string) => SpringConfig)
  /**
   * Base values (from -> enter), or: item => values
   * @default {}
   */
  from?: TFrom
  /**
   * Values that apply to new elements, or: fitem => values
   * @default {}
   */
  enter?: TEnter
  /**
   * Values that apply to leaving elements, or: item => values
   * @default {}
   */
  leave?: TLeave
  /**
   * Values that apply to elements that are neither entering nor leaving (you can use this to update present elements), or: item => values
   */
  update?: TUpdate
  /**
   * The same keys you would normally hand over to React in a list. Keys can be specified as a key-accessor function, an array of keys, or a single value
   */
  keys?:
    | ((item: TItem) => TransitionKeyProps)
    | Array<TransitionKeyProps>
    | TransitionKeyProps
  /**
   * An array of items to be displayed, this is used by Transition as the primary means of detecting changes.
   * @default {}
   */
  items: TItem[] | TItem
  /**
   * A single function-child that receives the individual item and return a functional component (item => props => view)
   */
  children?: (
    item: TItem
  ) => SpringRendererFunc<TInit & TFrom & TEnter & TLeave & TUpdate>
}

export class Transition<
  TItem,
  TInit extends object,
  TFrom extends object,
  TEnter extends object,
  TLeave extends object,
  TUpdate extends object
> extends PureComponent<
  TransitionProps<TItem, TInit, TFrom, TEnter, TLeave, TUpdate>
> {}

type TrailKeyProps = string | number

interface TrailProps<TItem, DS extends object = {}> {
  /**
   * Will skip rendering the component if true and write to the dom directly
   * @default false
   */
  native?: boolean
  /**
   * Spring config, or for individual keys: fn(key => config)
   * @default config.default
   */
  config?: SpringConfig | ((key: string) => SpringConfig)
  /**
   * Base values, optional
   */
  from?: Partial<DS>
  /**
   * Animates to ...
   */
  to?: DS
  /**
   * An array of items to be displayed, use this if you need access to the actual items when distributing values as functions
   */
  items: TItem[] | TItem
  /**
   * Item keys (the same keys you'd hand over to react in a list). If you specify items, keys can be an accessor function (item => item.key)
   * @default item => item
   */
  keys?: ((item: TItem) => TrailKeyProps) | Array<TrailKeyProps> | TrailKeyProps
  /**
   * A single function-child that receives the individual item and return a functional component (item, index) => props => view)
   */
  children?: (item: TItem, index: number) => SpringRendererFunc<DS>
  /**
   * When true the trailing order is switched, it will then trail bottom to top
   */
  reverse?: boolean
}

export class Trail<TItem, DS extends object> extends PureComponent<
  TrailProps<TItem, DS>
> {}

interface ParallaxProps {
  pages: number

  config?: SpringConfig | ((key: string) => SpringConfig)

  scrolling?: boolean

  horizontal?: boolean

  ref?: Ref<Parallax>
}

export class Parallax extends PureComponent<ParallaxProps> {
  scrollTo: (offset: number) => void
}

interface ParallaxLayerProps {
  factor?: number

  offset?: number

  speed?: number
}

export class ParallaxLayer extends PureComponent<ParallaxLayerProps> {}

interface KeyframesProps<DS extends object = {}> {
  state?: string
}

export class Keyframes<
  S extends object,
  DS extends object
> extends PureComponent<KeyframesProps<DS> & S> {
  static create<S extends object, DS extends object>(
    primitive: ComponentType
  ): (states: object) => (props: object) => Keyframes<S, DS>
  static Spring<S extends object, DS extends object>(
    states: object
  ): (
    props: object
  ) => Keyframes<
    S | Pick<SpringProps<DS>, Exclude<keyof SpringProps<DS>, 'to'>>,
    DS
  >
  static Trail<S extends object, DS extends object>(
    states: object
  ): (
    props: object
  ) => Keyframes<
    S | Pick<TrailProps<DS>, Exclude<keyof TrailProps<DS>, 'to'>>,
    DS
  >
  static Transition<S extends object, DS extends object>(
    states: object
  ): (
    props: object
  ) => Keyframes<
    S | Pick<TransitionProps<S, DS>, Exclude<keyof TransitionProps<DS>, 'to'>>,
    DS
  >
}
