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

export function useSpring<Props extends UnknownProps>(
  props: () => (Props & Valid<Props, UseSpringProps<Props>>) | UseSpringProps,
  deps?: any[]
): [
  SpringValues<Props>,
  SpringUpdateFn<PickAnimated<Props>>,
  SpringStopFn<UnknownProps>
]

export function useSpring<Props extends UnknownProps>(
  props: (Props & Valid<Props, UseSpringProps<Props>>) | UseSpringProps,
  deps?: any[]
): SpringValues<PickAnimated<Props>>

export function useSpring(props: any, deps?: any[]): any {
  const isFn = is.fun(props)
  const [result, set, stop] = useSprings(1, isFn ? props : [props], deps)
  return isFn ? [result[0], set, stop] : result
}
