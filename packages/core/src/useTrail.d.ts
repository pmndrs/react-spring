import { SpringValues, SpringUpdateFn, SpringStopFn } from './types/spring'
import { UseSpringProps } from './useSpring'
import { FrameValues } from './types/common'

export declare function useTrail<Props extends object>(
  count: number,
  props: () => Props & UseSpringProps<Props>
): [SpringValues<Props>[], SpringUpdateFn<FrameValues<Props>>, SpringStopFn]

export declare function useTrail<Props extends object>(
  count: number,
  props: Props extends Function ? UseSpringProps : Props & UseSpringProps<Props>
): SpringValues<Props>[]
