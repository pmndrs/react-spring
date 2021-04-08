import { useContext, useMemo, useRef } from 'react'
import { Lookup } from '@react-spring/types'
import {
  is,
  each,
  usePrev,
  useOnce,
  useForceUpdate,
  useLayoutEffect,
} from '@react-spring/shared'

import {
  ControllerFlushFn,
  ControllerUpdate,
  PickAnimated,
  SpringValues,
} from '../types'
import { UseSpringProps } from './useSpring'
import { declareUpdate } from '../SpringValue'
import {
  Controller,
  getSprings,
  flushUpdateQueue,
  setSprings,
} from '../Controller'
import { hasProps, detachRefs, replaceRef } from '../helpers'
import { SpringContext } from '../SpringContext'
import { SpringRef } from '../SpringRef'

export type UseSpringsProps<State extends Lookup = Lookup> = unknown &
  ControllerUpdate<State> & {
    ref?: SpringRef<State>
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
  ? [SpringValues<State>[], SpringRef<State>]
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
  ? [SpringValues<State>[], SpringRef<State>]
  : never

/** @internal */
export function useSprings(
  length: number,
  props: any[] | ((i: number, ctrl: Controller) => any),
  deps?: readonly any[]
): any {
  const propsFn = is.fun(props) && props
  if (propsFn && !deps) deps = []

  // Create a local ref if a props function or deps array is ever passed.
  const ref = useMemo(
    () => (propsFn || arguments.length == 3 ? new SpringRef() : void 0),
    []
  )

  interface State {
    // The controllers used for applying updates.
    ctrls: Controller[]
    // The queue of changes to make on commit.
    queue: Array<() => void>
    // The flush function used by controllers.
    flush: ControllerFlushFn
  }

  // Set to 0 to prevent sync flush.
  const layoutId = useRef(0)
  const forceUpdate = useForceUpdate()

  // State is updated on commit.
  const state = useMemo(
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
    }),
    []
  )

  const ctrls = [...state.ctrls]
  const updates: any[] = []

  // Cache old controllers to dispose in the commit phase.
  const prevLength = usePrev(length) || 0
  const oldCtrls = ctrls.slice(length, prevLength)

  // Create new controllers when "length" increases, and destroy
  // the affected controllers when "length" decreases.
  useMemo(() => {
    ctrls.length = length
    declareUpdates(prevLength, length)
  }, [length])

  // Update existing controllers when "deps" are changed.
  useMemo(() => {
    declareUpdates(0, Math.min(prevLength, length))
  }, deps)

  /** Fill the `updates` array with declarative updates for the given index range. */
  function declareUpdates(startIndex: number, endIndex: number) {
    for (let i = startIndex; i < endIndex; i++) {
      const ctrl = ctrls[i] || (ctrls[i] = new Controller(null, state.flush))

      const update: UseSpringProps<any> = propsFn
        ? propsFn(i, ctrl)
        : (props as any)[i]

      if (update) {
        updates[i] = declareUpdate(update)
      }
    }
  }

  // New springs are created during render so users can pass them to
  // their animated components, but new springs aren't cached until the
  // commit phase (see the `useLayoutEffect` callback below).
  const springs = ctrls.map((ctrl, i) => getSprings(ctrl, updates[i]))

  const context = useContext(SpringContext)
  const prevContext = usePrev(context)
  const hasContext = context !== prevContext && hasProps(context)

  useLayoutEffect(() => {
    layoutId.current++

    // Replace the cached controllers.
    state.ctrls = ctrls

    // Flush the commit queue.
    const { queue } = state
    if (queue.length) {
      state.queue = []
      each(queue, cb => cb())
    }

    // Clean up any unused controllers.
    each(oldCtrls, ctrl => {
      detachRefs(ctrl, ref)
      ctrl.stop(true)
    })

    // Update existing controllers.
    each(ctrls, (ctrl, i) => {
      const values = springs[i]
      setSprings(ctrl, values)

      // Attach the controller to the local ref.
      ref?.add(ctrl)

      // Update the default props.
      if (hasContext) {
        ctrl.start({ default: context })
      }

      // Apply updates created during render.
      const update = updates[i]
      if (update) {
        // Update the injected ref if needed.
        replaceRef(ctrl, update.ref)

        // When an injected ref exists, the update is postponed
        // until the ref has its `start` method called.
        if (ctrl.ref) {
          ctrl.queue.push(update)
        } else {
          ctrl.start(update)
        }
      }
    })
  })

  // Cancel the animations of all controllers on unmount.
  useOnce(() => () => {
    each(state.ctrls, ctrl => ctrl.stop(true))
  })

  // Return a deep copy of the `springs` array so the caller can
  // safely mutate it during render.
  const values = springs.map(x => ({ ...x }))

  return ref ? [values, ref] : values
}
