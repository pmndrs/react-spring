import { useLayoutEffect } from 'react-layout-effect'
import { is, UnknownProps } from 'shared'

import { Valid } from '../types/common'
import {
  PickAnimated,
  SpringStartFn,
  SpringStopFn,
  SpringValues,
} from '../types'
import { UseSpringProps } from './useSpring'
import { Controller } from '../Controller'
import { useSprings } from './useSprings'
import { getProps } from '../helpers'

export type UseTrailProps<Props extends object = any> = UseSpringProps<Props>

export function useTrail<Props extends object>(
  length: number,
  props: (
    i: number,
    ctrl: Controller
  ) => UseTrailProps | (Props & Valid<Props, UseTrailProps<Props>>),
  deps?: any[]
): [
  SpringValues<PickAnimated<Props>>[],
  SpringStartFn<PickAnimated<Props>>,
  SpringStopFn<UnknownProps>
]

export function useTrail<Props extends object>(
  length: number,
  props: UseTrailProps | (Props & Valid<Props, UseTrailProps<Props>>),
  deps?: any[]
): SpringValues<PickAnimated<Props>>[]

export function useTrail(length: number, propsArg: unknown, deps?: any[]) {
  const propsFn = is.fun(propsArg) && propsArg

  if (propsFn && arguments.length < 3) {
    deps = [] // Skip updates after first render.
  }

  const ctrls: Controller[] = []
  const result = useSprings(
    length,
    (i, ctrl) => {
      ctrls[i] = ctrl
      return getProps(propsArg, i, ctrl) as any
    },
    deps
  )

  useLayoutEffect(() => {
    const reverse = is.obj(propsArg) && propsArg.reverse
    for (let i = 0; i < ctrls.length; i++) {
      const parent = ctrls[i + (reverse ? 1 : -1)]
      if (parent) ctrls[i].update({ to: parent.springs }).start()
    }
  }, deps)

  const update = result[1]
  result[1] = propsArg => {
    const reverse = is.obj(propsArg) && propsArg.reverse
    return update((i, ctrl) => {
      const props = getProps(propsArg, i, ctrl)!
      const parent = ctrls[i + (reverse ? 1 : -1)]
      if (parent) props.to = parent.springs
      return props
    })
  }

  return propsFn ? result : result[0]
}
