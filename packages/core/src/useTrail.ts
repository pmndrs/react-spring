import { useLayoutEffect } from 'react'
import { is } from 'shared'

import { useSprings } from './useSprings'
import { UseSpringProps } from './useSpring'
import { SpringValues, SpringStopFn, SpringsUpdateFn } from './types/spring'
import { FrameValues } from './types/common'
import { Controller } from './Controller'
import { getProps } from './helpers'

export function useTrail<Props extends object, From, To>(
  length: number,
  props: Props & UseSpringProps<From, To>,
  deps?: any[]
): SpringValues<Props>[]

export function useTrail<Props extends object, From, To>(
  length: number,
  props: (i: number, ctrl: Controller) => Props & UseSpringProps<From, To>,
  deps?: any[]
): [
  SpringValues<Props>[],
  SpringsUpdateFn<FrameValues<Props>>,
  SpringStopFn<FrameValues<Props>>
]

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
