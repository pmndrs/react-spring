import { RefObject } from 'react'
import { is } from 'shared'
import {
  SpringHandle,
  SpringValues,
  SpringUpdateFn,
  SpringStopFn,
  SpringProps,
} from './types/spring'
import { useSprings } from './useSprings'
import { FrameValues, Tween } from './types/common'

/**
 * The props that `useSpring` recognizes.
 */
export type UseSpringProps<From = unknown, To = unknown> = {
  from?: From
  to?: To
} & SpringProps<Tween<From, To>> & {
    /**
     * Used to access the imperative API.
     *
     * Animations never auto-start when `ref` is defined.
     */
    ref?: RefObject<SpringHandle<Tween<From, To>>>
  }

/**
 * Animate one or more named values.
 */
export function useSpring<From, To>(
  props: UseSpringProps<From, To>,
  deps?: any[]
): SpringValues<Tween<From, To>>

export function useSpring<From, To>(
  props: () => UseSpringProps<From, To>,
  deps?: any[]
): [
  SpringValues<Tween<From, To>>,
  SpringUpdateFn<FrameValues<Tween<From, To>>>,
  SpringStopFn<FrameValues<Tween<From, To>>>
]

export function useSpring(props: any, deps?: any[]): any {
  const isFn = is.fun(props)
  const [result, set, stop] = useSprings(1, isFn ? props : [props], deps)
  return isFn ? [result[0], set, stop] : result
}
