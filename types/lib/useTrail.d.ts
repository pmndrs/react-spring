import { UseSpringProps, SpringUpdateFn, SpringStopFn } from './useSpring'
import { SpringValues, PickAnimated } from './common'

export function useTrail<Props extends object>(
  count: number,
  props: () => UseSpringProps<Props>
): [SpringValues<Props>[], SpringUpdateFn<PickAnimated<Props>>, SpringStopFn]

export function useTrail<Props extends object>(
  count: number,
  props: UseSpringProps<Props>
): SpringValues<Props>[]
