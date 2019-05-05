import { UseSpringProps, SpringUpdateFn, SpringStopFn } from './useSpring'
import { SpringValues } from './animated'
import { PickAnimated } from './common'

export function useSprings<Props extends object>(
  count: number,
  props: (i: number) => UseSpringProps<Props>
): [SpringValues<Props>[], SpringUpdateFn<PickAnimated<Props>>, SpringStopFn]

export function useSprings<Props extends object>(
  count: number,
  props: ReadonlyArray<UseSpringProps<Props>>
): SpringValues<Props>[]
