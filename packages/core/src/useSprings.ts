import { useMemo, useRef, useEffect, RefObject } from 'react'
import { is, each, usePrev, useOnce, Merge } from 'shared'
import { useMemoOne } from 'use-memo-one'

import {
  SpringStopFn,
  SpringValues,
  SpringsUpdateFn,
  SpringsHandle,
} from './types/spring'
import { FrameValues, Tween } from './types/common'
import { callProp, fillArray } from './helpers'
import { UseSpringProps } from './useSpring'
import { Controller } from './Controller'

export type UseSpringsProps<From = unknown, To = unknown> = Merge<
  UseSpringProps<From, To>,
  {
    /**
     * Used to access the imperative API.
     *
     * Animations never auto-start when `ref` is defined.
     */
    ref?: RefObject<SpringsHandle<Tween<From, To>>>
  }
>

export function useSprings<Props extends object, From, To>(
  length: number,
  props: (i: number) => Props & UseSpringsProps<From, To>,
  deps?: any[]
): [
  SpringValues<Props>[],
  SpringsUpdateFn<FrameValues<Props>>,
  SpringStopFn<FrameValues<Props>>
]

export function useSprings<Props extends object, From, To>(
  length: number,
  props: ReadonlyArray<Props & UseSpringsProps<From, To>>,
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

  const ref = isFn ? props[0] && props[0].ref : null
  const state = useRef({ ctrls, ref }).current

  const api = useMemo(
    (): SpringsHandle => ({
      get: i => state.ctrls[i],
      get controllers() {
        return state.ctrls
      },
      update: props => {
        const { ctrls, ref } = state
        each(ctrls, (ctrl, i) => {
          ctrl.update(
            is.fun(props) ? props(i, ctrl) : is.arr(props) ? props[i] : props
          )
          if (!ref) ctrl.start()
        })
        return api
      },
      async start() {
        const results = await Promise.all(state.ctrls.map(ctrl => ctrl.start()))
        return {
          value: results.map(result => result.value),
          finished: results.every(result => result.finished),
        }
      },
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
        each(ctrls, ctrl => ctrl.start())
      }
    } else if (!isFn) {
      api.update(props)
    }
  }, deps)

  // Destroy the controllers on unmount
  useOnce(() => () => {
    each(state.ctrls, ctrl => ctrl.dispose())
  })

  const values = ctrls.map(ctrl => ({ ...ctrl.springs }))
  return isFn ? [values, api.update, api.stop] : values
}
