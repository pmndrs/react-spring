import { useMemo, RefObject, useLayoutEffect, useImperativeHandle } from 'react'
import { is, each, usePrev, useOnce, UnknownProps, Merge } from 'shared'

import {
  SpringStopFn,
  SpringValues,
  SpringsUpdateFn,
  SpringHandle,
} from './types/spring'
import { PickAnimated } from './types/common'
import { UseSpringProps } from './useSpring'
import { Controller, ControllerProps } from './Controller'
import { getProps, useMemo as useMemoOne } from './helpers'

export type UseSpringsProps<Props extends object = any> = Merge<
  UseSpringProps<Props>,
  {
    ref?: RefObject<SpringHandle<PickAnimated<Props>>>
  }
>

export function useSprings<Props extends object>(
  length: number,
  props: Props & UseSpringsProps<Props>,
  deps?: any[]
): SpringValues<Props>[]

export function useSprings<
  P extends object[],
  Props extends object = P[number]
>(
  length: number,
  props: P & UseSpringsProps<P[number]>[],
  deps?: any[]
): SpringValues<Props>[]

export function useSprings<Props extends object>(
  length: number,
  props: (i: number, ctrl: Controller) => Props & UseSpringsProps<Props>,
  deps?: any[]
): [
  SpringValues<Props>[],
  SpringsUpdateFn<PickAnimated<Props>>,
  SpringStopFn<UnknownProps>
]

export function useSprings(length: number, props: unknown, deps?: any[]): any {
  const propsFn = is.fun(props) && props
  const propsArr = is.arr(props) && props

  if (propsFn && arguments.length < 3) {
    deps = [] // Skip updates after first render.
  }

  // The "ref" prop is taken from the props of the first spring only.
  // The ref is assumed to *never* change after the first render.
  let ref: RefObject<SpringHandle> | undefined

  const ctrls: Controller[] = useMemoOne(() => [], [])
  const updates: ControllerProps[] = []
  const prevLength = usePrev(length) || 0
  useMemoOne(() => {
    if (prevLength > length) {
      for (let i = length; i < prevLength; i++) {
        ctrls[i].dispose()
      }
    }
    ctrls.length = length
    for (let i = 0; i < length; i++) {
      const ctrl = ctrls[i] || (ctrls[i] = new Controller())
      const update: UseSpringProps<any> = propsArr
        ? propsArr[i]
        : propsFn
        ? propsFn(i, ctrl)
        : { ...props }
      if (update) {
        update.default = true
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
          ctrl.update(getProps(props, i, ctrl))
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

  useImperativeHandle(ref, () => api)

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
