declare module 'react-spring' {
    import { PureComponent, ReactNode, ComponentClass } from 'react';
    type SpringConfig = {
      tension: number;
      friction: number;
    };
    type SpringProps<S extends object, DS extends object = {}> = {
      /**
       * @description
       * Spring config ({ tension, friction })
       * @type {SpringConfig}
       */
      config?: SpringConfig;
      /**
       * @description
       * Will skip rendering the component if true and write to the dom directly
       * @type {boolean}
       */
      native?: boolean;
      /**
       * @description
       * Base styles, optional
       * @type {DS}
       */
      from?: DS;
      /**
       * @description
       * Animates to...
       * @type {S}
       */
      to: DS;
      onRest?: () => void;
      onFrame?: () => void;
      children: (
        params: DS & S,
      ) => ReactNode | Array<(params: DS & S) => ReactNode>;
      render?: (params: DS & S) => ReactNode;
      immediate?: boolean | string[];
      reset?: boolean;
    };
    export const config: {
      default: SpringConfig;
      gentle: SpringConfig;
      wobbly: SpringConfig;
      stiff: SpringConfig;
      slow: SpringConfig;
    };
    export class Spring<
      S extends object,
      DS extends object
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
  