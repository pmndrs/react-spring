import { each, is, useIsomorphicLayoutEffect } from '@react-spring/shared'
import { Lookup } from '@react-spring/types'

import { Valid } from '../types/common'
import { PickAnimated, SpringValues } from '../types'

import { SpringRef } from '../SpringRef'
import { Controller } from '../Controller'

import { UseSpringProps } from './useSpring'
import { useSprings } from './useSprings'
import { replaceRef } from '../helpers'

export type UseTrailProps<Props extends object = any> = UseSpringProps<Props>

export function useTrail<Props extends object>(
  length: number,
  props: (
    i: number,
    ctrl: Controller
  ) => UseTrailProps | (Props & Valid<Props, UseTrailProps<Props>>),
  deps?: readonly any[]
): PickAnimated<Props> extends infer State
  ? State extends Lookup<any>
    ? [SpringValues<State>[], SpringRef<State>]
    : never
  : never

/**
 * This hook is an abstraction around `useSprings` and is designed to
 * automatically orchestrate the springs to stagger one after the other
 *
 * ```jsx
 * export const MyComponent = () => {
 *  const trails = useTrail(3, {opacity: 0})
 *
 *  return trails.map(styles => <animated.div style={styles} />)
 * }
 * ```
 *
 * @param length – The number of springs you want to create
 * @param propsArg – The props to pass to the internal `useSprings` hook,
 * therefore is the same as `useSprings`.
 *
 * @public
 */
export function useTrail<Props extends object>(
  length: number,
  props: UseTrailProps | (Props & Valid<Props, UseTrailProps<Props>>)
): SpringValues<PickAnimated<Props>>[]

/**
 * This hook is an abstraction around `useSprings` and is designed to
 * automatically orchestrate the springs to stagger one after the other
 *
 * ```jsx
 * export const MyComponent = () => {
 *  const trails = useTrail(3, {opacity: 0}, [])
 *
 *  return trails.map(styles => <animated.div style={styles} />)
 * }
 * ```
 *
 * @param length – The number of springs you want to create
 * @param propsArg – The props to pass to the internal `useSprings` hook,
 * therefore is the same as `useSprings`.
 * @param deps – The optional array of dependencies to pass to the internal
 * `useSprings` hook, therefore is the same as `useSprings`.
 *
 * @public
 */
export function useTrail<Props extends object>(
  length: number,
  props: UseTrailProps | (Props & Valid<Props, UseTrailProps<Props>>),
  deps: readonly any[]
): PickAnimated<Props> extends infer State
  ? State extends Lookup<any>
    ? [SpringValues<State>[], SpringRef<State>]
    : never
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

  useIsomorphicLayoutEffect(() => {
    /**
     * Run through the ref passed by the `useSprings` hook.
     */
    each(result[1].current, (ctrl, i) => {
      const parent = result[1].current[i + (reverse ? 1 : -1)]

      /**
       * If there's a passed ref then we replace the ctrl ref with it
       */
      replaceRef(ctrl, passedRef)

      /**
       * And if there's a ctrl ref then we update instead of start
       * which means nothing is fired until the start method
       * of said passedRef is called.
       */
      if (ctrl.ref) {
        if (parent) {
          ctrl.update({ to: parent.springs })
        }

        return
      }

      if (parent) {
        ctrl.start({ to: parent.springs })
      } else {
        ctrl.start()
      }
    })
  }, deps)

  if (propsFn || arguments.length == 3) {
    const ref = passedRef ?? result[1]

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

  return result[0]
}
