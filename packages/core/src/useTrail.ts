import { useImperativeHandle } from 'react'
import { useLayoutEffect } from 'react-layout-effect'
import { is, UnknownProps } from 'shared'

import { PickAnimated, Valid } from './types/common'
import {
  SpringValues,
  SpringStopFn,
  SpringsUpdateFn,
  SpringHandle,
} from './types/spring'
import { UseSpringProps } from './useSpring'
import { Controller, ControllerProps } from './Controller'
import { useSprings } from './useSprings'
import { getProps, callProp } from './helpers'

export function useTrail<Props extends object>(
  length: number,
  props: (
    i: number,
    ctrl: Controller
  ) => (Props & Valid<Props, UseSpringProps<Props>>) | UseSpringProps,
  deps?: any[]
): [
  SpringValues<PickAnimated<Props>>[],
  SpringsUpdateFn<PickAnimated<Props>>,
  SpringStopFn<UnknownProps>
]

export function useTrail<Props extends object>(
  length: number,
  props: (Props & Valid<Props, UseSpringProps<Props>>) | UseSpringProps,
  deps?: any[]
): SpringValues<PickAnimated<Props>>[]

export function useTrail<Props extends object>(
  length: number,
  propsArg: (Props & Valid<Props, UseSpringProps<Props>>) | UseSpringProps,
  deps?: any[]
) {
  const propsFn = is.fun(propsArg) && propsArg
  const calledProps = callProp<UseSpringProps>(propsArg)

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

  useImperativeHandle(
    calledProps.ref,
    (): SpringHandle<ControllerProps> => ({
      get controllers() {
        return ctrls
      },
      update(props) {
        ctrls.forEach((ctrl, i) =>
          ctrl.update(
            is.fun(props) ? props(i, ctrl) : is.arr(props) ? props[i] : props
          )
        )
        return this
      },
      async start() {
        const results = await Promise.all(ctrls.map(ctrl => ctrl.start()))
        return {
          value: results.map(result => result.value),
          finished: results.every(result => result.finished),
        }
      },
      stop: keys => ctrls.forEach(ctrl => ctrl.stop(keys)),
      pause: keys => ctrls.forEach(ctrl => ctrl.pause(keys)),
      resume: keys => ctrls.forEach(ctrl => ctrl.resume(keys)),
    }),
    [calledProps.ref]
  )

  return propsFn ? result : result[0]
}
