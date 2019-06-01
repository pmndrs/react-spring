import { SpringValues, SpringUpdateFn, SpringStopFn } from './types/spring'
import { UseSpringProps } from './useSpring'
import { PickAnimated } from './types/common'

export declare function useSprings<Props extends object>(
  count: number,
  props: (i: number) => Props & UseSpringProps<Props>
): [SpringValues<Props>[], SpringUpdateFn<PickAnimated<Props>>, SpringStopFn]

export declare function useSprings<Props extends object>(
  count: number,
  props: ReadonlyArray<Props & UseSpringProps<Props>>
): SpringValues<Props>[]
