import { SpringValues, SpringUpdateFn, SpringStopFn } from './types/spring'
import { UseSpringProps } from './useSpring'
import { PickAnimated } from './types/common'

export declare function useTrail<Props extends object>(
  count: number,
  props: () => Props & UseSpringProps<Props>
): [SpringValues<Props>[], SpringUpdateFn<PickAnimated<Props>>, SpringStopFn]

export declare function useTrail<Props extends object>(
  count: number,
  props: Props extends Function ? UseSpringProps : Props & UseSpringProps<Props>
): SpringValues<Props>[]
