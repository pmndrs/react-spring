import {
  Component,
  PureComponent,
  ReactNode,
  ComponentClass,
  ComponentType,
} from 'react'

export type SpringEasingFunc = (t: number) => number

export interface SpringConfig {
  tension?: number
  friction?: number
  velocity?: number
  overshootClamping?: boolean
  restSpeedThreshold?: number
  restDisplacementThreshold?: number

  duration?: number
  easing?: SpringEasingFunc
}

type SpringRendererFunc<S extends object, DS extends object = {}> = (
  params: DS & S
) => ReactNode

interface SpringProps<S extends object, DS extends object = {}> {
  /**
   * Spring config ({ tension, friction })
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
  from?: DS
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
  onRest?: () => void
  /**
   * Frame by frame callback, first argument passed is the animated value
   */
  onFrame?: () => void
  /**
   * Takes a function that receives interpolated styles
   */
  children?: SpringRendererFunc<S, DS> | Array<SpringRendererFunc<S, DS>>
  /**
   * Same as children, but takes precedence if present
   */
  render?: SpringRendererFunc<S, DS>
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
   * Animation implementation
   * @default SpringAnimation
   */
  impl?: any
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

export class Spring<S extends object, DS extends object> extends PureComponent<
  SpringProps<S, DS> & S
> {}

export function interpolate(
  parent: number[],
  config: (...args: number[]) => any
): any

export const animated: {
  [Tag in keyof JSX.IntrinsicElements]: ComponentClass<
    JSX.IntrinsicElements[Tag]
  >
}

type TransitionKeyProps = string | number
type TransitionItemProps = string | number | object

interface TransitionProps<S extends object, DS extends object = {}> {
  /**
   * First render base values (initial from -> enter), if present overrides "from", can be "null" to skip first mounting transition, or: item => values
   */
  initial?: DS | null,
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
   * Base styles
   * @default {}
   */
  from?: DS
  /**
   * Animated styles when the component is mounted
   * @default {}
   */
  enter?: DS
  /**
   * Unmount styles
   * @default {}
   */
  leave?: DS

  update?: DS
  /**
   * A collection of unique keys that must match with the childrens order
   * Can be omitted if children/render aren't an array
   * Can be a function, which then acts as a key-accessor which is useful when you use the items prop
   * @default {}
   */
  keys?:
    | ((params: TransitionItemProps) => TransitionKeyProps)
    | Array<TransitionKeyProps>
    | TransitionKeyProps
  /**
   * Optional. Let items refer to the actual data and from/enter/leaver/update can return per-object styles
   * @default {}
   */
  items?: Array<TransitionItemProps> | TransitionItemProps

  children?:
    | SpringRendererFunc<S, DS>
    | Array<SpringRendererFunc<S, DS>>
    | boolean

  render?:
    | SpringRendererFunc<S, DS>
    | Array<SpringRendererFunc<S, DS>>
    | boolean
}

export class Transition<
  S extends object,
  DS extends object
> extends PureComponent<TransitionProps<S, DS> & S> {}

type TrailKeyProps = string | number
type TrailKeyItemProps = string | number | object

interface TrailProps<S extends object, DS extends object = {}> {
  native?: boolean

  config?: SpringConfig | ((key: string) => SpringConfig)

  from?: DS

  to?: DS

  keys?:
    | ((params: TrailKeyItemProps) => TrailKeyProps)
    | Array<TrailKeyProps>
    | TrailKeyProps

  children?: SpringRendererFunc<S, DS> | Array<SpringRendererFunc<S, DS>>

  render?: SpringRendererFunc<S, DS> | Array<SpringRendererFunc<S, DS>>
}

export class Trail<S extends object, DS extends object> extends PureComponent<
  TrailProps<S, DS> & S
> {}

interface ParallaxProps<S extends object, DS extends object = {}> {
  pages: number

  config?: SpringConfig | ((key: string) => SpringConfig)

  scrolling?: boolean

  horizontal?: boolean
}

export class Parallax<
  S extends object,
  DS extends object
> extends PureComponent<ParallaxProps<S, DS> & S> {}

interface ParallaxLayerProps<S extends object, DS extends object = {}> {
  factor?: number

  offset?: number

  speed?: number
}

export class ParallaxLayer<
  S extends object,
  DS extends object
> extends PureComponent<ParallaxLayerProps<S, DS> & S> {}

interface KeyframesProps<S extends object, DS extends object = {}> {
  state?: string
}

export class Keyframes<S extends object, DS extends object> extends PureComponent<
  KeyframesProps<S, DS> & S
> {
  static create<S extends object, DS extends object>(
    primitive: ComponentType
  ): (states: object) => (props: object) => Keyframes<S, DS>
  static Spring<S extends object, DS extends object>(
    states: object
  ): (props: object) => Keyframes<S | Pick<SpringProps<S,DS>, Exclude<keyof SpringProps<S,DS>, "to">>, DS>
  static Trail<S extends object, DS extends object>(
    states: object
  ): (props: object) => Keyframes<S | Pick<TrailProps<S,DS>, Exclude<keyof TrailProps<S,DS>, "to">>, DS> 
  static Transition<S extends object, DS extends object>(
    states: object
  ): (props: object) => Keyframes<S | Pick<TransitionProps<S,DS>, Exclude<keyof TransitionProps<S,DS>, "to">>, DS> 
}
