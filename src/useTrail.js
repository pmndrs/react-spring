import { useRef, useMemo, useEffect } from 'react'
import { callProp, is } from './shared/helpers'
import { useSprings } from './useSprings'

/** API
 * const trails = useTrail(number, { ... })
 * const [trails, set] = useTrail(number, (index) => ({ ... }))
 */

export const useTrail = (length, props) => {
  const mounted = useRef(false)
  const isFn = is.fun(props)  
  const instances = useRef()
  const currentProps = useRef()
  const [reverse, setReverse] = useState(false)

  const [result, set, pause] = useSprings(length, (i, ctrl) => {
    const updateProps = callProp(props, i)
    if (i === 0) {
      instances.current = []
      currentProps.current = []
      setReverse(updateProps.reverse)
    }
    instances.current.push(ctrl)
    currentProps.current.push(updateProps)
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
        const updateProps = currentProps.current[i]
        const last = props.reverse ? i === 0 : length - 1 === i
        const attachIdx = props.reverse ? i + 1 : i - 1
        const attachController = instances.current[attachIdx]
        return {
          ...props,
          config: callProp(props.config || updateProps.config, i),
          attach: attachController && (() => attachController),
        }
      }),
    [length, reverse]
  )
  // Update controller if props aren't functional
  useEffect(() => void (mounted.current && !isFn && updateCtrl(props)))
  // Update mounted flag and destroy controller on unmount
  useEffect(() => void (mounted.current = true), [])

  return isFn ? [result, updateCtrl, pause] : result
}
