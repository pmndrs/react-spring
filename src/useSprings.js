import { useMemo, useRef, useImperativeHandle, useEffect } from 'react'
import Ctrl from './animated/Controller'
import { callProp, fillArray, is, toArray } from './shared/helpers'

/** API
 * const props = useSprings(number, [{ ... }, { ... }, ...])
 * const [props, set] = useSprings(number, (i, controller) => ({ ... }))
 */

export const useSprings = (length, propsArg) => {
  const mounted = useRef(false)
  const ctrl = useRef()
  const isFn = is.fun(propsArg)

  // The `propsArg` coerced into an array
  const props = isFn ? [] : propsArg

  // The controller maintains the animation values, starts and stops animations
  const [controllers, setProps, ref, api] = useMemo(() => {
    let ref, controllers
    return [
      // Recreate the controllers whenever `length` changes
      (controllers = fillArray(length, i => {
        const c = new Ctrl()
        const p = props[i] || (props[i] = callProp(propsArg, i, c))
        if (i === 0) ref = p.ref
        return c.update(p)
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

  // Once mounted, update the local state and start any animations.
  useEffect(() => {
    if (!isFn || ctrl.current !== controllers) {
      controllers.forEach((c, i) => {
        const p = props[i]
        // Set the default props for async updates
        c.setProp('config', p.config)
        c.setProp('immediate', p.immediate)
      })
    }

    if (ctrl.current !== controllers) {
      if (ctrl.current) ctrl.current.forEach(c => c.destroy())
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
        (...args) => ctrl.current.forEach(c => c.stop(...args)),
      ]
    : values
}
