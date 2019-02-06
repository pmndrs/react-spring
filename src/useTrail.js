import { useRef, useMemo, useEffect } from 'react'
import { callProp, is } from './shared/helpers'
import { useSprings } from './useSprings'

/** API
 * const trails = useTrail(number, { ... })
 * const [trails, set] = useTrail(number, () => ({ ... }))
 */

export const useTrail = (length, props) => {
  const mounted = useRef(false)
  const isFn = is.fun(props)
  const updateProps = callProp(props)
  const instances = useRef()

  const [result, set] = useSprings(length, (i, ctrl) => {
    if (i === 0) instances.current = []
    instances.current.push(ctrl)
    return {
      ...updateProps,
      config: callProp(updateProps.config, i),
      attach: i > 0 && (() => instances.current[i - 1]),
    }
  })

  // Set up function to update controller
  const updateCtrl = useMemo(
    () => props =>
      set((i, ctrl) => {
        const last = props.reverse ? i === 0 : length - 1 === i
        const attachIdx = props.reverse ? i + 1 : i - 1
        const attachController = instances.current[attachIdx]
        return {
          ...props,
          config: callProp(props.config || updateProps.config, i),
          attach: attachController && (() => attachController),
        }
      }),
    [length, updateProps.reverse]
  )
  // Update controller if props aren't functional
  useEffect(() => void (mounted.current && !isFn && updateCtrl(props)))
  // Update mounted flag and destroy controller on unmount
  useEffect(() => void (mounted.current = true), [])

  return isFn ? [result, updateCtrl] : result
}
