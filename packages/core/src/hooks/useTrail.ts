import { useLayoutEffect } from 'react-layout-effect'
import { is } from 'shared'

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
  deps?: readonly any[]
): PickAnimated<Props> extends infer State
  ? [SpringValues<State & object>[], SpringStartFn<State>, SpringStopFn<State>]
  : never

export function useTrail<Props extends object>(
  length: number,
  props: UseTrailProps | (Props & Valid<Props, UseTrailProps<Props>>)
): SpringValues<PickAnimated<Props>>[]

export function useTrail<Props extends object>(
  length: number,
  props: UseTrailProps | (Props & Valid<Props, UseTrailProps<Props>>),
  deps: readonly any[]
): PickAnimated<Props> extends infer State
  ? [SpringValues<State & object>[], SpringStartFn<State>, SpringStopFn<State>]
  : never

export function useTrail(
  length: number,
  propsArg: unknown,
  deps?: readonly any[]
) {
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

  if (arguments.length == 3) {
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
    return result
  }
  return result[0]
}
