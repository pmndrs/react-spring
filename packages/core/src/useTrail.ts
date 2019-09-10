import { is } from 'shared'
import { useSprings } from './useSprings'
import { UseSpringProps } from './useSpring'
import { SpringValues, SpringStopFn, SpringsUpdateFn } from './types/spring'
import { FrameValues } from './types/common'
import { Controller } from './Controller'

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

// TODO: support "props.reverse"
export function useTrail(length: number, propsArg: unknown, deps?: any[]) {
  const propsFn = is.fun(propsArg) && propsArg

  if (propsFn && arguments.length < 3) {
    deps = [] // Skip updates after first render.
  }

  let prevCtrl: Controller | undefined
  const result = useSprings(
    length,
    (i, ctrl) => {
      const props = propsFn ? propsFn(i, ctrl) : { ...propsArg }
      if (props) {
        if (prevCtrl && !props.to) {
          props.to = prevCtrl.springs
        }
        prevCtrl = ctrl
        return props
      }
    },
    deps
  )

  return propsFn ? result : result[0]
}
