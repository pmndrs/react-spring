import { RefProp, UnknownProps, Remap } from '@react-spring/types'
import { is } from '@react-spring/shared'

import {
  ControllerUpdate,
  PickAnimated,
  SpringStartFn,
  SpringStopFn,
  SpringValues,
} from '../types'
import { Valid } from '../types/common'
import { SpringHandle } from '../SpringHandle'
import { useSprings } from './useSprings'

/**
 * The props that `useSpring` recognizes.
 */
export type UseSpringProps<Props extends object = any> = unknown &
  PickAnimated<Props> extends infer State
  ? Remap<
      ControllerUpdate<State> & {
        /**
         * Used to access the imperative API.
         *
         * When defined, the render animation won't auto-start.
         */
        ref?: RefProp<SpringHandle<State>>
      }
    >
  : never

/**
 * The `props` function is only called on the first render, unless
 * `deps` change (when defined). State is inferred from forward props.
 */
export function useSpring<Props extends object>(
  props:
    | Function
    | (() => (Props & Valid<Props, UseSpringProps<Props>>) | UseSpringProps),
  deps?: readonly any[] | undefined
): [
  SpringValues<PickAnimated<Props>>,
  SpringStartFn<PickAnimated<Props>>,
  SpringStopFn<UnknownProps>
]

/**
 * Updated on every render, with state inferred from forward props.
 */
export function useSpring<Props extends object>(
  props: (Props & Valid<Props, UseSpringProps<Props>>) | UseSpringProps
): SpringValues<PickAnimated<Props>>

/**
 * Updated only when `deps` change, with state inferred from forwad props.
 */
export function useSpring<Props extends object>(
  props: (Props & Valid<Props, UseSpringProps<Props>>) | UseSpringProps,
  deps: readonly any[] | undefined
): [
  SpringValues<PickAnimated<Props>>,
  SpringStartFn<PickAnimated<Props>>,
  SpringStopFn<UnknownProps>
]

/** @internal */
export function useSpring(props: any, deps?: readonly any[]) {
  const isFn = is.fun(props)
  const [[values], update, stop] = useSprings(
    1,
    isFn ? props : [props],
    isFn ? deps || [] : deps
  )
  return isFn || arguments.length == 2
    ? ([values, update, stop] as const)
    : values
}
