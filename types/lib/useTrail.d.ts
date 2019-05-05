import { UseSpringProps, SpringUpdateFn, SpringStopFn } from './useSpring'
import { SpringValues } from './animated'
import { PickAnimated } from './common'

export function useTrail<Props extends object>(
  count: number,
  props: () => UseSpringProps<Props>
): [SpringValues<Props>[], SpringUpdateFn<PickAnimated<Props>>, SpringStopFn]

export function useTrail<Props extends object>(
  count: number,
  props: UseSpringProps<Props>
): SpringValues<Props>[]
