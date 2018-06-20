declare module 'react-spring' {
  import { Component, PureComponent, ReactNode, ComponentClass } from 'react';

  export type SpringConfig = {
    tension: number;
    friction: number;
  };

  type SpringProps<S extends object, DS extends object = {}> = {
    /**
     * Spring config ({ tension, friction })
     * @default config.default
     */
    config?: SpringConfig | ((key: string) => SpringConfig);
    /**
     * Will skip rendering the component if true and write to the dom directly
     * @default false
     */
    native?: boolean;
    /**
     * Base styles
     * @default {}
     */
    from?: DS;
    /**
     * Animates to...
     * @default {}
     */
    to: DS;
    /**
     * Callback when the animation comes to a still-stand
     */
    onRest?: () => void;
    /**
     * Frame by frame callback, first argument passed is the animated value
     */
    onFrame?: () => void;
    /**
     * Takes a function that receives interpolated styles
     */
    children?: ((
      params: DS & S,
    ) => ReactNode) | Array<(params: DS & S) => ReactNode>;
    /**
     * Same as children, but takes precedence if present
     */
    render?: (params: DS & S) => ReactNode;
    /**
     * Prevents animation if true, you can also pass individual keys
     * @default false
     */
    immediate?: boolean | string[] | ((key: string) => boolean);
    /**
     * When true it literally resets: from -> to
     * @default false
     */
    reset?: boolean;
    /**
     * Animation implementation
     * @default SpringAnimation
     */
    impl?: any,
    /**
     * Inject props
     * @default undefined
     */
    inject?: any,
  };

  export const config: {
    /** default: { tension: 170, friction: 26 } */
    default: SpringConfig;
    /** gentle: { tension: 120, friction: 14 } */
    gentle: SpringConfig;
    /** wobbly: { tension: 180, friction: 12 } */
    wobbly: SpringConfig;
    /** stiff: { tension: 210, friction: 20 } */
    stiff: SpringConfig;
    /** slow: { tension: 280, friction: 60 } */
    slow: SpringConfig;
  };

  export class Spring<
    S extends object,
    DS extends object,
  > extends PureComponent<SpringProps<S, DS>> {}

  export function interpolate(
    parent: number[],
    config: (...args: number[]) => any,
  ): any;

  export const animated: {
    [Tag in keyof JSX.IntrinsicElements]: ComponentClass<
      JSX.IntrinsicElements[Tag]
    >
  };

  type TransitionKeyProps = string | number;
  type TransitionItemProps = string | number | object;

  type TransitionProps<S extends object, DS extends object = {}> = {
    /**
     * Will skip rendering the component if true and write to the dom directly
     * @default false
     */
    native?: boolean;
    /**
     * Spring config ({ tension, friction })
     * @default config.default
     */
    config?: SpringConfig | ((key: string) => SpringConfig);
    /**
     * Base styles
     * @default {}
     */
    from?: DS;
    /**
     * Animated styles when the component is mounted
     * @default {}
     */
    enter?: DS;
    /**
     * Unmount styles
     * @default {}
     */
    leave?: DS;

    update?: DS;
    /**
     * A collection of unique keys that must match with the childrens order
     * Can be omitted if children/render aren't an array
     * Can be a function, which then acts as a key-accessor which is useful when you use the items prop
     * @default {}
     */
    keys?: ((params: any) => TransitionKeyProps) | Array<TransitionKeyProps> | TransitionKeyProps;
    /**
     * Optional. Let items refer to the actual data and from/enter/leaver/update can return per-object styles
     * @default {}
     */
    items?: Array<TransitionItemProps> | TransitionItemProps;

    children?: ((
      params: DS & S,
    ) => ReactNode) | Array<(params: DS & S) => ReactNode>;

    render?: ((
      params: DS & S,
    ) => ReactNode) | Array<(params: DS & S) => ReactNode>;
  };

  export class Transition<
    S extends object,
    DS extends object,
  > extends PureComponent<TransitionProps<S, DS>> {}

  type TrailProps<S extends object, DS extends object = {}> = {
    native?: boolean;

    config?: SpringConfig | ((key: string) => SpringConfig);

    from?: DS;

    to?: DS;

    children: ((
      params: DS & S,
    ) => ReactNode) | Array<(params: DS & S) => ReactNode>;

    render: ((
      params: DS & S,
    ) => ReactNode) | Array<(params: DS & S) => ReactNode>;
  };

  export class Trail<
    S extends object,
    DS extends object,
  > extends PureComponent<TrailProps<S, DS>> {}

  type ParallaxProps<S extends object, DS extends object = {}> = {
    pages: number;

    config?: SpringConfig | ((key: string) => SpringConfig);

    scrolling?: boolean;

    horizontal?: boolean;
  };

  export class Parallax<
    S extends object,
    DS extends object,
  > extends PureComponent<ParallaxProps<S, DS>> {}

  type ParallaxLayerProps<S extends object, DS extends object = {}> = {
    factor?: number;

    offset?: number;

    speed?: number;
  };

  export class ParallaxLayer<
    S extends object,
    DS extends object,
  > extends PureComponent<ParallaxLayerProps<S, DS>> {}

  type KeyframesProps<S extends object, DS extends object = {}> = {
    script: (next: Function) => Function;
  };

  export class Keyframes<
    S extends object,
    DS extends object,
  > extends Component<KeyframesProps<S, DS>> {}
}
