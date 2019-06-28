import {
  SpringValues,
  SpringUpdateFn,
  SpringStopFn,
  SpringsUpdateFn,
} from './types/spring'
import { UseSpringProps } from './useSpring'
import { PickAnimated } from './types/common'

export declare function useSprings<Props extends object>(
  count: number,
  props: (i: number) => Props & UseSpringProps<Props>
): [SpringValues<Props>[], SpringsUpdateFn<PickAnimated<Props>>, SpringStopFn]

export declare function useSprings<Props extends object>(
  count: number,
  props: ReadonlyArray<Props & UseSpringProps<Props>>
): SpringValues<Props>[]
