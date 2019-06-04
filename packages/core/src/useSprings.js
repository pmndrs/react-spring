import { useMemo, useRef, useImperativeHandle, useEffect } from 'react'
import { is, usePrev, useOnce } from 'shared'
import { callProp, fillArray } from './helpers'
import { useMemoOne } from 'use-memo-one'
import { Controller } from './Controller'

/** API
 * const props = useSprings(number, [{ ... }, { ... }, ...])
 * const [props, set] = useSprings(number, (i, controller) => ({ ... }))
 */

export const useSprings = (length, propsArg, deps) => {
  const hasNewSprings = length !== usePrev(length)
  const isFn = is.fun(propsArg)

  const state = useRef({
    springs: [],
    ref: null,
  }).current

  // The `propsArg` coerced into an array
  const props = isFn ? [] : propsArg

  // Recreate the controllers whenever `length` changes
  const springs = useMemoOne(
    () =>
      fillArray(length, i => {
        const s = new Controller()
        const p = props[i] || (props[i] = callProp(propsArg, i, s))
        return s.update(p)
      }),
    [length]
  )

  const { start, update, stop } = useMemo(
    () => ({
      /** Apply any pending updates */
      start: () =>
        Promise.all(state.springs.map(s => new Promise(done => s.start(done)))),
      /** Update the spring controllers */
      update: props => {
        const isFn = is.fun(props)
        const isArr = is.arr(props)
        state.springs.forEach((spring, i) => {
          spring.update(
            isFn ? callProp(props, i, spring) : isArr ? props[i] : props
          )
          if (!state.ref) spring.start()
        })
      },
      /** Stop one key or all keys from animating */
      stop: (...args) => state.springs.forEach(s => s.stop(...args)),
    }),
    []
  )

  const ref = props[0] ? props[0].ref : isFn ? state.ref : null
  useImperativeHandle(ref, () => ({
    start,
    stop,
    get controllers() {
      return state.springs
    },
  }))

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
      state.springs.forEach(s => s.destroy())
      state.springs = springs
      state.ref = ref
      if (!ref) {
        springs.forEach(s => s.start())
      }
    } else if (!isFn) {
      update(props)
    }
  }, deps)

  // Destroy the controllers on unmount
  useOnce(() => () => {
    state.springs.forEach(s => s.destroy())
  })

  const values = springs.map(s => ({ ...s.animated }))
  return isFn ? [values, update, stop] : values
}
