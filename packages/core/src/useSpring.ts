import { RefObject } from 'react'
import { is, Remap, Falsy } from 'shared'
import {
  SpringHandle,
  SpringValues,
  SpringUpdateFn,
  SpringStopFn,
  SpringProps,
} from './types/spring'
import { useSprings } from './useSprings'
import { FrameValues } from './types/common'

type RangeProps<From, To> = {
  from?: From
  to?: To
}

type Join<From, To> = Remap<
  (From extends Falsy ? {} : From) &
    (To extends Falsy | Function | ReadonlyArray<any> ? {} : To)
>

/**
 * The props that `useSpring` recognizes.
 */
export type UseSpringProps<From = unknown, To = unknown> = RangeProps<
  From,
  To
> &
  SpringProps<Join<From, To>>

type G = UseSpringProps['to']

/**
 * Animate one or more named values.
 */
export function useSpring<Props extends object, From, To>(
  props: Props &
    UseSpringProps<From, To> & {
      /**
       * Used to access the imperative API.
       *
       * Animations never auto-start when `ref` is defined.
       */
      ref?: RefObject<SpringHandle<Join<From, To>>>
    },
  deps?: any[]
): SpringValues<Props>

export function useSpring<Props extends object, From, To>(
  props: () => Props & UseSpringProps<From, To>,
  deps?: any[]
): [
  SpringValues<Props>,
  SpringUpdateFn<FrameValues<Props>>,
  SpringStopFn<FrameValues<Props>>
]

export function useSpring<Props extends object>(
  props: Props,
  deps?: any[]
): any {
  const isFn = is.fun(props)
  const [result, set, stop] = useSprings<Props>(1, isFn ? props : [props], deps)
  return isFn ? [result[0], set, stop] : result
}
