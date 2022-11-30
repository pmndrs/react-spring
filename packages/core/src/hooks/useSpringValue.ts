import { useConstant, useOnce } from '@react-spring/shared'

import { SpringValue } from '../SpringValue'
import { SpringUpdate } from '../types'

/**
 * Creates a constant single `SpringValue` that can be interacted
 * with imperatively. This is an advanced API and does not react
 * to updates from the parent component e.g. passing a new initial value
 *
 *
 * ```jsx
 * export const MyComponent = () => {
 *   const opacity = useSpringValue(1)
 *
 *   return <animated.div style={{ opacity }} />
 * }
 * ```
 *
 * @param initial – The initial value of the `SpringValue`.
 * @param props – Typically the same props as `useSpring` e.g. `config`, `loop` etc.
 *
 * @public
 */
export const useSpringValue = <T>(
  initial: Exclude<T, object>,
  props?: SpringUpdate<T>
) => {
  const springValue = useConstant(() => new SpringValue(initial, props))

  useOnce(() => () => {
    springValue.stop()
  })

  return springValue
}
