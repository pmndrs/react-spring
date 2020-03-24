import { useMemo, useState, useRef } from 'react'
import { useLayoutEffect } from 'react-layout-effect'
import {
  is,
  each,
  usePrev,
  useOnce,
  RefProp,
  UnknownProps,
  Merge,
  useForceUpdate,
} from 'shared'

import {
  ControllerFlushFn,
  PickAnimated,
  SpringStopFn,
  SpringValues,
  SpringsUpdateFn,
  SpringHandle,
} from '../types'
import { UseSpringProps } from './useSpring'
import { createUpdate } from '../SpringValue'
import {
  Controller,
  getSprings,
  flushUpdateQueue,
  setSprings,
} from '../Controller'
import { getProps, useMemo as useMemoOne } from '../helpers'

export type UseSpringsProps<Props extends object = any> = Merge<
  UseSpringProps<Props>,
  {
    ref?: RefProp<SpringHandle<PickAnimated<Props>>>
  }
>

/**
 * Animations are updated on re-render.
 */
export function useSprings<
  P extends object[],
  Props extends object = P[number]
>(
  length: number,
  props: P & UseSpringsProps<Props>[]
): SpringValues<PickAnimated<Props>>[]

/**
 * When the `deps` argument exists, you get the `update` and `stop` function.
 */
export function useSprings<
  P extends object[],
  Props extends object = P[number]
>(
  length: number,
  props: P & UseSpringsProps<Props>[],
  deps: readonly any[] | undefined
): [
  SpringValues<PickAnimated<Props>>[],
  SpringsUpdateFn<PickAnimated<Props>>,
  SpringStopFn<UnknownProps>
]

/**
 * When the `deps` argument exists, the `props` function is called whenever
 * the `deps` change on re-render.
 *
 * Without the `deps` argument, the `props` function is only called once.
 */
export function useSprings<Props extends object>(
  length: number,
  props: (i: number, ctrl: Controller) => Props & UseSpringsProps<Props>,
  deps?: readonly any[]
): [
  SpringValues<PickAnimated<Props>>[],
  SpringsUpdateFn<PickAnimated<Props>>,
  SpringStopFn<UnknownProps>
]

/** @internal */
export function useSprings(
  length: number,
  props: any[] | ((i: number, ctrl: Controller) => any),
  deps?: readonly any[]
): any {
  const propsFn = is.fun(props) && props
  if (propsFn && !deps) deps = []

  interface State {
    // The controllers used for applying updates.
    ctrls: Controller[]
    // The queue of changes to make on commit.
    queue: Array<() => void>
    // The flush function used by controllers.
    flush: ControllerFlushFn<UnknownProps>
  }

  // Set to 0 to prevent sync flush.
  const layoutId = useRef(0)
  const forceUpdate = useForceUpdate()

  // State is updated on commit.
  const [state] = useState(
    (): State => ({
      ctrls: [],
      queue: [],
      flush(ctrl, updates) {
        const springs = getSprings(ctrl, updates)

        // Flushing is postponed until the component's commit phase
        // if a spring was created since the last commit.
        const canFlushSync =
          layoutId.current > 0 &&
          !state.queue.length &&
          !Object.keys(springs).some(key => !ctrl.springs[key])

        return canFlushSync
          ? flushUpdateQueue(ctrl, updates)
          : new Promise<any>(resolve => {
              setSprings(ctrl, springs)
              state.queue.push(() => {
                resolve(flushUpdateQueue(ctrl, updates))
              })
              forceUpdate()
            })
      },
    })
  )

  // The imperative API ref from the props of the first controller.
  const refProp = useRef<RefProp<SpringHandle>>()

  const ctrls = [...state.ctrls]
  const updates: any[] = []

  // Cache old controllers to dispose in the commit phase.
  const prevLength = usePrev(length) || 0
  const disposed = ctrls.slice(length, prevLength)

  // Create new controllers when "length" increases, and destroy
  // the affected controllers when "length" decreases.
  useMemoOne(() => {
    ctrls.length = length
    getUpdates(prevLength, length)
  }, [length])

  // Update existing controllers when "deps" are changed.
  useMemoOne(() => {
    getUpdates(0, prevLength)
  }, deps)

  function getUpdates(startIndex: number, endIndex: number) {
    for (let i = startIndex; i < endIndex; i++) {
      const ctrl = ctrls[i] || (ctrls[i] = new Controller(null, state.flush))

      let update: UseSpringProps<any> = propsFn
        ? propsFn(i, ctrl)
        : (props as any)[i]

      if (update) {
        update = updates[i] = createUpdate(update)
        update.default = true
        if (i == 0) {
          refProp.current = update.ref
          update.ref = undefined
        }
      }
    }
  }

  const api = useMemo(
    (): SpringHandle => ({
      get controllers() {
        return state.ctrls
      },
      update: props => {
        each(state.ctrls, (ctrl, i) => {
          const update = getProps(props, i, ctrl)
          if (refProp.current) {
            ctrl.update(update)
          } else {
            ctrl.start(update)
          }
        })
        return api
      },
      start: async props => {
        const results = await Promise.all(
          state.ctrls.map((ctrl, i) => ctrl.start(getProps(props, i, ctrl)))
        )
        return {
          value: results.map(result => result.value),
          finished: results.every(result => result.finished),
        }
      },
      stop: keys => each(state.ctrls, ctrl => ctrl.stop(keys)),
      pause: keys => each(state.ctrls, ctrl => ctrl.pause(keys)),
      resume: keys => each(state.ctrls, ctrl => ctrl.resume(keys)),
    }),
    []
  )

  // New springs are created during render so users can pass them to
  // their animated components, but new springs aren't cached until the
  // commit phase (see the `useLayoutEffect` callback below).
  const springs = ctrls.map((ctrl, i) => getSprings(ctrl, updates[i]))

  useLayoutEffect(() => {
    layoutId.current++

    // Replace the cached controllers.
    state.ctrls = ctrls

    // Update the ref prop.
    if (refProp.current) {
      refProp.current.current = api
    }

    // Flush the commit queue.
    const { queue } = state
    if (queue.length) {
      state.queue = []
      each(queue, cb => cb())
    }

    // Dispose unused controllers.
    each(disposed, ctrl => ctrl.dispose())

    // Update existing controllers.
    each(ctrls, (ctrl, i) => {
      setSprings(ctrl, springs[i])

      // Apply updates created during render.
      const update = updates[i]
      if (update) {
        // Start animating unless a ref exists.
        if (refProp.current) {
          ctrl.queue.push(update)
        } else {
          ctrl.start(update)
        }
      }
    })
  })

  // Dispose all controllers on unmount.
  useOnce(() => () => {
    each(state.ctrls, ctrl => ctrl.dispose())
  })

  // Return a deep copy of the `springs` array so the caller can
  // safely mutate it during render.
  const values = springs.map(x => ({ ...x }))

  return propsFn || arguments.length == 3
    ? [values, api.update, api.stop]
    : values
}
