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
  // For the object-form props, derive reverse and ref directly from the
  // shared props — every spring receives the same props, so accumulating
  // them via the useSprings wrapper is unnecessary and unsafe: under
  // React.StrictMode the wrapper is not invoked on the second render
  // pass (useSprings caches via useMemo with [length] deps), which would
  // leave the accumulator stuck at its initial value.
  let reverse: boolean | undefined
  let passedRef: SpringRef | undefined = undefined

  if (!propsFn) {
    reverse = (propsArg as UseTrailProps).reverse
    passedRef = (propsArg as UseTrailProps).ref
  } else {
    reverse = true
  }

  const result = useSprings(
    length,
    (i, ctrl) => {
      const props = propsFn ? propsFn(i, ctrl) : propsArg
      if (propsFn) {
        passedRef = props.ref
        reverse = reverse && props.reverse
      }

      return props
    },
    // Ensure the props function is called when no deps exist.
    // This works around the 3 argument rule.
    deps || [{}]
  )

  useIsomorphicLayoutEffect(() => {
    const ctrls = result[1].current
    // The head is the only controller whose `flushUpdate` reaches the loop
    // recursion: it animates to a static `to`, so its result finishes. Every
    // other ctrl chains via `to: parent.springs` (fluid), which never settles
    // and so never triggers `createLoopUpdate`. Subscribing children to their
    // immediate parent would cascade exactly one level; subscribing every
    // non-head child directly to the head keeps the whole trail in phase.
    const head = ctrls[reverse ? ctrls.length - 1 : 0]
    const unsubscribers: Array<() => void> = []

    /**
     * Run through the ref passed by the `useSprings` hook.
     */
    each(ctrls, (ctrl, i) => {
      const parent = ctrls[i + (reverse ? 1 : -1)]

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
      } else if (parent) {
        ctrl.start({ to: parent.springs })
      } else {
        ctrl.start()
      }

      // Phase-sync non-head children to the head's loop iterations. Without
      // this, the parent snap-resets each cycle and every child filters the
      // ramp asymmetrically, trapping deeper children in a narrow mid-range
      // oscillation instead of completing the full sweep. See issue #1063.
      if (ctrl !== head) {
        unsubscribers.push(
          head.onLoopReset(() => {
            ctrl.start({ reset: true })
          })
        )
      }
    })

    return () => {
      each(unsubscribers, unsubscribe => unsubscribe())
    }
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
