import { useMemo, useState, useRef } from 'react'
import { useLayoutEffect } from 'react-layout-effect'
import {
  is,
  each,
  usePrev,
  useOnce,
  RefProp,
  UnknownProps,
  useForceUpdate,
  Lookup,
} from 'shared'

import {
  ControllerFlushFn,
  PickAnimated,
  SpringStartFn,
  SpringStopFn,
  SpringValues,
  ControllerUpdate,
} from '../types'
import { UseSpringProps } from './useSpring'
import { declareUpdate } from '../SpringValue'
import {
  Controller,
  getSprings,
  flushUpdateQueue,
  setSprings,
} from '../Controller'
import { useMemo as useMemoOne, hasProps } from '../helpers'
import { useSpringContext } from '../SpringContext'
import { SpringHandle } from '../SpringHandle'

export type UseSpringsProps<State extends Lookup = Lookup> = unknown &
  ControllerUpdate<State> & {
    ref?: RefProp<SpringHandle<State>>
  }

/**
 * When the `deps` argument exists, the `props` function is called whenever
 * the `deps` change on re-render.
 *
 * Without the `deps` argument, the `props` function is only called once.
 */
export function useSprings<Props extends UseSpringProps>(
  length: number,
  props: (i: number, ctrl: Controller) => Props,
  deps?: readonly any[]
): PickAnimated<Props> extends infer State
  ? [SpringValues<State & object>[], SpringStartFn<State>, SpringStopFn<State>]
  : never

/**
 * Animations are updated on re-render.
 */
export function useSprings<Props extends UseSpringsProps>(
  length: number,
  props: Props[] & UseSpringsProps<PickAnimated<Props>>[]
): SpringValues<PickAnimated<Props>>[]

/**
 * When the `deps` argument exists, you get the `update` and `stop` function.
 */
export function useSprings<Props extends UseSpringsProps>(
  length: number,
  props: Props[] & UseSpringsProps<PickAnimated<Props>>[],
  deps: readonly any[] | undefined
): PickAnimated<Props> extends infer State
  ? [SpringValues<State & object>[], SpringStartFn<State>, SpringStopFn<State>]
  : never

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
    declareUpdates(prevLength, length)
  }, [length])

  // Update existing controllers when "deps" are changed.
  useMemoOne(() => {
    declareUpdates(0, Math.min(prevLength, length))
  }, deps)

  /** Fill the `updates` array with declarative updates for the given index range. */
  function declareUpdates(startIndex: number, endIndex: number) {
    for (let i = startIndex; i < endIndex; i++) {
      const ctrl = ctrls[i] || (ctrls[i] = new Controller(null, state.flush))

      let update: UseSpringProps<any> = propsFn
        ? propsFn(i, ctrl)
        : (props as any)[i]

      if (update) {
        update = updates[i] = declareUpdate(update)
        if (i == 0) {
          refProp.current = update.ref
          update.ref = undefined
        }
      }
    }
  }

  const api = useMemo(() => {
    return SpringHandle.create(() => state.ctrls)
  }, [])

  // New springs are created during render so users can pass them to
  // their animated components, but new springs aren't cached until the
  // commit phase (see the `useLayoutEffect` callback below).
  const springs = ctrls.map((ctrl, i) => getSprings(ctrl, updates[i]))

  const context = useSpringContext()
  const hasContext = hasProps(context)

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
      const values = springs[i]
      setSprings(ctrl, values)

      // Update the default props.
      if (hasContext) {
        ctrl.start({ default: context })
      }

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
    ? [values, api.start, api.stop]
    : values
}
