declare module 'react-spring' {
  import { PureComponent, ReactNode, ComponentClass } from 'react';

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
    children?: (
      params: DS & S,
    ) => ReactNode | Array<(params: DS & S) => ReactNode>;
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
}
