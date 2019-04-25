import { useMemo, useRef, useImperativeHandle, useEffect } from 'react'
import { callProp, fillArray, is, toArray, usePrev } from './shared/helpers'
import Controller from './animated/Controller'

/** API
 * const props = useSprings(number, [{ ... }, { ... }, ...])
 * const [props, set] = useSprings(number, (i, controller) => ({ ... }))
 */

export const useSprings = (length, propsArg) => {
  const hasNewSprings = length !== usePrev(length)
  const isFn = is.fun(propsArg)

  // The `propsArg` coerced into an array
  const props = isFn ? [] : propsArg

  // Recreate the controllers whenever `length` changes
  const springsRef = useRef()
  const springs = useMemo(
    () =>
      fillArray(length, i => {
        const s = new Controller()
        const p = props[i] || (props[i] = callProp(propsArg, i, s))
        return s.update(p)
      }),
    [length]
  )

  const ref = springs[0].props.ref
  const { start, update, stop } = useMemo(
    () => ({
      /** Apply any pending updates */
      start: () =>
        Promise.all(
          springsRef.current.map(s => new Promise(done => s.start(done)))
        ),
      /** Update the spring controllers */
      update: props => {
        const isFn = is.fun(props)
        if (!isFn) props = toArray(props)
        springsRef.current.forEach((spring, i) => {
          spring.update(isFn ? callProp(props, i, spring) : props[i])
          if (!ref) spring.start()
        })
      },
      /** Stop one key or all keys from animating */
      stop: (...args) => springsRef.current.forEach(s => s.stop(...args)),
    }),
    []
  )

  useImperativeHandle(ref, () => ({ start, stop }))

  // Once mounted, update the local state and start any animations.
  useEffect(() => {
    if (!isFn || hasNewSprings) {
      props.forEach((p, i) => {
        // Set default props for async updates
        springs[i].setProp('config', p.config)
        springs[i].setProp('immediate', p.immediate)
      })
    }
    if (hasNewSprings) {
      if (springsRef.current) {
        springsRef.current.forEach(s => s.destroy())
      }
      springsRef.current = springs
      if (!ref) {
        springs.forEach(s => s.start())
      }
    } else if (!isFn) {
      update(props)
    }
  })

  // Destroy the controllers on unmount
  useEffect(() => {
    return () => springsRef.current.forEach(s => s.destroy())
  }, [])

  const values = springs.map(s => s.animated)
  return isFn ? [values, update, stop] : values
}
