import { RefObject } from 'react'
import { is, UnknownProps } from 'shared'

import {
  SpringValues,
  SpringUpdateFn,
  SpringStopFn,
  SpringHandle,
} from './types/spring'
import { PickAnimated, Valid } from './types/common'
import { useSprings } from './useSprings'
import { ControllerProps } from 'src'

/**
 * The props that `useSpring` recognizes.
 */
export type UseSpringProps<Props extends object = any> = unknown &
  PickAnimated<Props> extends infer State
  ? ControllerProps<State> & {
      /**
       * Used to access the imperative API.
       *
       * Animations never auto-start when `ref` is defined.
       */
      ref?: RefObject<SpringHandle<State>>
    }
  : never

/**
 * Animations are updated on re-render.
 */
export function useSpring<Props extends UnknownProps>(
  props: (Props & Valid<Props, UseSpringProps<Props>>) | UseSpringProps
): SpringValues<Props>

/**
 * When the `deps` argument exists, you get the `update` and `stop` function.
 */
export function useSpring<Props extends UnknownProps>(
  props: (Props & Valid<Props, UseSpringProps<Props>>) | UseSpringProps,
  deps: any[] | undefined
): [
  SpringValues<Props>,
  SpringUpdateFn<PickAnimated<Props>>,
  SpringStopFn<UnknownProps>
]

/**
 * When the `deps` argument exists, the `props` function is called whenever
 * the `deps` change on re-render.
 *
 * Without the `deps` argument, the `props` function is only called once.
 */
export function useSpring<Props extends UnknownProps>(
  props: () => (Props & Valid<Props, UseSpringProps<Props>>) | UseSpringProps,
  deps?: any[]
): [
  SpringValues<Props>,
  SpringUpdateFn<PickAnimated<Props>>,
  SpringStopFn<UnknownProps>
]

/** @internal */
export function useSpring(props: any, deps?: any[]): any {
  const isFn = is.fun(props)
  const [values, update, stop] = useSprings(1, isFn ? props : [props], deps)
  return isFn || arguments.length == 3 ? [values[0], update, stop] : values
}
