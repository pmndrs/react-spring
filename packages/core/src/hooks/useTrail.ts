import { each, is, useLayoutEffect } from '@react-spring/shared'

import { Valid } from '../types/common'
import { PickAnimated, SpringValues, AsyncResult } from '../types'

import { ControllerUpdateFn, SpringRef } from '../SpringRef'
import { Controller } from '../Controller'

import { UseSpringProps } from './useSpring'
import { useSprings } from './useSprings'

export type UseTrailProps<Props extends object = any> = UseSpringProps<Props>

export function useTrail<Props extends object>(
  length: number,
  props: (
    i: number,
    ctrl: Controller
  ) => UseTrailProps | (Props & Valid<Props, UseTrailProps<Props>>),
  deps?: readonly any[]
): PickAnimated<Props> extends infer State
  ? [SpringValues<State>[], SpringRef<State>]
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
  ? [SpringValues<State>[], SpringRef<State>]
  : never

export function useTrail(
  length: number,
  propsArg: unknown,
  deps?: readonly any[]
) {
  const propsFn = is.fun(propsArg) && propsArg
  if (propsFn && !deps) deps = []

  // The trail is reversed when every render-based update is reversed.
  let reverse = true
  let passedRef: SpringRef | undefined = undefined

  const result = useSprings(
    length,
    (i, ctrl) => {
      const props = propsFn ? propsFn(i, ctrl) : propsArg
      passedRef = props.ref
      reverse = reverse && props.reverse
      return props
    },
    // Ensure the props function is called when no deps exist.
    // This works around the 3 argument rule.
    deps || [{}]
  )

  const ref = passedRef ?? result[1]

  useLayoutEffect(() => {
    each(ref.current, (ctrl, i) => {
      const parent = ref.current[i + (reverse ? 1 : -1)]
      if (parent) {
        ctrl.start({ to: parent.springs })
      } else {
        ctrl.start()
      }
    })
  }, deps)

  /**
   * Overwrite the start function so it runs our
   * specific trail-making way
   */
  ref['start'] = (propsArg?: object | ControllerUpdateFn) => {
    const results: AsyncResult[] = []

    each(ref.current, (ctrl, i) => {
      const props = is.fun(propsArg) ? propsArg(i, ctrl) : propsArg

      const parent = ref.current[i + (reverse ? 1 : -1)]
      if (parent) {
        results.push(ctrl.start({ ...props, to: parent.springs }))
      } else {
        results.push(ctrl.start({ ...props }))
      }
    })

    return results
  }

  if (propsFn || arguments.length == 3) {
    ref['_getProps'] = (propsArg, ctrl, i) => {
      const props = is.fun(propsArg) ? propsArg(i, ctrl) : propsArg
      if (props) {
        const parent = ref.current[i + (props.reverse ? 1 : -1)]
        if (parent) props.to = parent.springs
        return props
      }
    }
    return result
  }

  /**
   * Overwrite the start function so it runs our
   * specific trail-making way
   * WARNING: we don't want to replace the `start` function
   * if the props are fn, it will cause an error.
   * See: https://github.com/pmndrs/react-spring/issues/1810
   * But we need this to be done for:
   * https://github.com/pmndrs/react-spring/issues/1512
   */
  ref['start'] = (propsArg?: object | ControllerUpdateFn) => {
    const results: AsyncResult[] = []

    each(ref.current, (ctrl, i) => {
      const props = is.fun(propsArg) ? propsArg(i, ctrl) : propsArg

      const parent = ref.current[i + (reverse ? 1 : -1)]

      if (parent) {
        results.push(ctrl.start({ ...props, to: parent.springs }))
      } else {
        results.push(ctrl.start({ ...props }))
      }
    })

    return results
  }

  return result[0]
}
