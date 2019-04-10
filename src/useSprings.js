import { useMemo, useRef, useImperativeHandle, useEffect } from 'react'
import Ctrl from './animated/Controller'
import { callProp, fillArray, is, toArray } from './shared/helpers'

/** API
 * const props = useSprings(number, [{ ... }, { ... }, ...])
 * const [props, set] = useSprings(number, (i, controller) => ({ ... }))
 */

export const useSprings = (length, props) => {
  const mounted = useRef(false)
  const ctrl = useRef()
  const isFn = is.fun(props)

  // The controller maintains the animation values, starts and stops animations
  const [controllers, setProps, ref, api] = useMemo(() => {
    let ref, controllers
    return [
      // Recreate the controllers whenever `length` changes
      (controllers = fillArray(length, i => {
        const c = new Ctrl()
        const newProps = isFn ? callProp(props, i, c) : props[i]
        if (i === 0) ref = newProps.ref
        return c.update(newProps)
      })),
      // This updates the controllers with new props
      props => {
        const isFn = is.fun(props)
        if (!isFn) props = toArray(props)
        controllers.forEach((c, i) => {
          c.update(isFn ? callProp(props, i, c) : props[i])
          if (!ref) c.start()
        })
      },
      // The imperative API is accessed via ref
      ref,
      ref && {
        start: () =>
          Promise.all(controllers.map(c => new Promise(r => c.start(r)))),
        stop: finished => controllers.forEach(c => c.stop(finished)),
        controllers,
      },
    ]
  }, [length])

  // Attach the imperative API to its ref
  useImperativeHandle(ref, () => api, [api])

  // Update controller if props aren't functional
  useEffect(() => {
    if (ctrl.current !== controllers) {
      if (ctrl.current) ctrl.current.map(c => c.destroy())
      ctrl.current = controllers
    }
    if (mounted.current) {
      if (!isFn) setProps(props)
    } else if (!ref) {
      controllers.forEach(c => c.start())
    }
  })

  // Update mounted flag and destroy controller on unmount
  useEffect(() => {
    mounted.current = true
    return () => ctrl.current.forEach(c => c.destroy())
  }, [])

  // Return animated props, or, anim-props + the update-setter above
  const values = controllers.map(c => c.getValues())
  return isFn
    ? [
        values,
        setProps,
        (key, finished) => ctrl.current.forEach(c => c.stop(key, finished)),
      ]
    : values
}
