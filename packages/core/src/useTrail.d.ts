import { SpringValues, SpringUpdateFn, SpringStopFn } from './types/spring'
import { UseSpringProps } from './useSpring'
import { FrameValues } from './types/common'

export declare function useTrail<Props extends object, From, To>(
  count: number,
  props: Props & UseSpringProps<From, To>
): SpringValues<Props>[]

export declare function useTrail<Props extends object, From, To>(
  count: number,
  props: () => Props & UseSpringProps<From, To>
): [
  SpringValues<Props>[],
  SpringUpdateFn<FrameValues<Props>>,
  SpringStopFn<FrameValues<Props>>
]
