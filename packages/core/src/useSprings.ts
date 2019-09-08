import { useMemo, useRef, useImperativeHandle, useEffect } from 'react'
import { is, each, usePrev, useOnce } from 'shared'
import { callProp, fillArray } from './helpers'
import { useMemoOne } from 'use-memo-one'
import { Controller } from './Controller'
import {
  SpringUpdate,
  SpringStopFn,
  SpringValues,
  SpringsUpdateFn,
  SpringProps,
  SpringsHandle,
} from './types/spring'
import { UseSpringProps } from './useSpring'
import { FrameValues } from './types/common'

export function useSprings<Props extends object, From, To>(
  length: number,
  props: (i: number) => Props & UseSpringProps<From, To>,
  deps?: any[]
): [
  SpringValues<Props>[],
  SpringsUpdateFn<FrameValues<Props>>,
  SpringStopFn<FrameValues<Props>>
]

export function useSprings<Props extends object>(
  length: number,
  props: ReadonlyArray<Props & UseSpringProps<Props>>,
  deps?: any[]
): SpringValues<Props>[]

export function useSprings(length: number, propsArg: any, deps?: any[]): any {
  const isLengthChanged = length !== usePrev(length)
  const isFn = is.fun(propsArg)

  const props = is.arr(propsArg) ? propsArg : []
  const ctrls = useMemoOne(
    () =>
      fillArray(length, i => {
        const s = new Controller()
        const p = props[i] || (props[i] = callProp(propsArg, i, s))
        return s.update(p)
      }),
    // Stop all animations when `length` changes.
    [length]
  )

  const state = useRef({
    ctrls,
    ref: isFn ? props[0] && props[0].ref : null,
  }).current

  const api = useMemo(
    (): SpringsHandle<object> => ({
      get: i => state.ctrls[i],
      get controllers() {
        return state.ctrls
      },
      /** Update the spring controllers */
      update: props => {
        const isFn = is.fun(props)
        const isArr = is.arr(props)

        const update = async (ctrl, i) => {
          await ctrl
            .update(isFn ? callProp(props, i, ctrl) : isArr ? props[i] : props)
            .start()
        }

        const { ctrls, ref } = state
        if (state.ref) {
          return Promise.all(ctrls.map(update))
        }
        return api
      },
      /** Apply any pending updates */
      start: () => Promise.all(state.ctrls.map(ctrl => ctrl.start())),
      /** Stop one key or all keys from animating */
      stop: keys => each(state.ctrls, ctrl => ctrl.stop(keys)),
    }),
    []
  )

  // Once mounted, update the local state and start any animations.
  useEffect(() => {
    if (isLengthChanged) {
      each(state.ctrls, ctrl => ctrl.dispose())
      state.ctrls = ctrls
      state.ref = ref
      if (!ref) {
        each(springs, s => s.start())
      }
    } else if (!isFn) {
      update(props)
    }
  }, deps)

  // Destroy the controllers on unmount
  useOnce(() => () => {
    each(state.springs, s => s.dispose())
  })

  const values = springs.map(s => ({ ...s.values }))
  return isFn ? [values, update, stop] : values
}
