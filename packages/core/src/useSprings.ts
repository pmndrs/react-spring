import { useMemo, RefObject, useLayoutEffect } from 'react'
import { is, each, usePrev, useOnce, Merge, OneOrMore } from 'shared'
import { useMemoOne } from 'use-memo-one'

import {
  SpringStopFn,
  SpringValues,
  SpringsUpdateFn,
  SpringHandle,
  SpringProps,
} from './types/spring'
import { FrameValues, Tween } from './types/common'
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
    ref?: RefObject<SpringHandle<Tween<From, To>>>
  }
>

export function useSprings<Props extends object, From, To>(
  length: number,
  props: (i: number, ctrl: Controller) => Props & UseSpringsProps<From, To>,
  deps?: any[]
): [
  SpringValues<Props>[],
  SpringsUpdateFn<FrameValues<Props>>,
  SpringStopFn<FrameValues<Props>>
]

export function useSprings<Props extends object, From, To>(
  length: number,
  props: OneOrMore<Props & UseSpringsProps<From, To>>,
  deps?: any[]
): SpringValues<Props>[]

export function useSprings(length: number, props: unknown, deps?: any[]): any {
  const propsFn = is.fun(props) && props
  const propsArr = is.arr(props) && props

  // The "ref" prop is taken from the props of the first spring only.
  // The ref is assumed to *never* change after the first render.
  let ref: RefObject<SpringHandle> | undefined

  const ctrls: Controller[] = useMemoOne(() => [], [])
  const updates: SpringProps[] = []
  useMemoOne(() => {
    const prevLength = usePrev(length) || 0
    if (prevLength > length) {
      for (let i = length; i < prevLength; i++) {
        ctrls[i].dispose()
      }
    }
    ctrls.length = length
    for (let i = 0; i < length; i++) {
      const ctrl = ctrls[i] || (ctrls[i] = new Controller())
      const update = propsArr ? propsArr[i] : propsFn ? propsFn(i, ctrl) : props
      if (update) {
        if (i == 0 && update.ref) {
          ref = update.ref
        }
        if (i < prevLength) {
          updates[i] = update
        } else {
          // Update new controllers immediately, so their
          // spring values exist during first render.
          ctrl.update(update)
        }
      }
    }
  }, deps)

  const api = useMemo(
    (): SpringHandle => ({
      get controllers() {
        return ctrls
      },
      update: props => {
        each(ctrls, (ctrl, i) => {
          ctrl.update(
            is.fun(props) ? props(i, ctrl) : is.arr(props) ? props[i] : props
          )
          if (!ref) ctrl.start()
        })
        return api
      },
      async start() {
        const results = await Promise.all(ctrls.map(ctrl => ctrl.start()))
        return {
          value: results.map(result => result.value),
          finished: results.every(result => result.finished),
        }
      },
      stop: keys => each(ctrls, ctrl => ctrl.stop(keys)),
    }),
    []
  )

  useLayoutEffect(() => {
    each(updates, (update, i) => ctrls[i].update(update))
    if (!ref) {
      each(ctrls, ctrl => ctrl.start())
    }
  }, deps)

  useOnce(() => () => {
    each(ctrls, ctrl => ctrl.dispose())
  })

  const values = ctrls.map(ctrl => ({ ...ctrl.springs }))
  return propsFn ? [values, api.update, api.stop] : values
}
