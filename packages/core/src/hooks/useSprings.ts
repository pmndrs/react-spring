import { DependencyList, useContext, useMemo, useRef } from 'react'
import { Lookup } from '@react-spring/types'
import {
  is,
  each,
  usePrev,
  useOnce,
  useForceUpdate,
  useIsomorphicLayoutEffect,
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
import type { SpringRef as SpringRefType } from '../SpringRef'

export type UseSpringsProps<State extends Lookup = Lookup> = unknown &
  ControllerUpdate<State> & {
    ref?: SpringRefType<State>
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
  ? State extends Lookup<any>
    ? [SpringValues<State>[], SpringRefType<State>]
    : never
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
  deps: DependencyList
): PickAnimated<Props> extends infer State
  ? State extends Lookup<any>
    ? [SpringValues<State>[], SpringRefType<State>]
    : never
  : never

/** @internal */
export function useSprings(
  length: number,
  props: any[] | ((i: number, ctrl: Controller) => any),
  deps?: DependencyList
): any {
  const propsFn = is.fun(props) && props
  if (propsFn && !deps) deps = []

  // Create a local ref if a props function or deps array is ever passed.
  const ref = useMemo(
    () => (propsFn || arguments.length == 3 ? SpringRef() : void 0),
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

  // useRef is needed to get the same references accross renders.
  // Note that controllers are a shallow copy of the final array.
  // So any array manipulation won't impact the final array until
  // the commit phase, in the useIsomorphicLayoutEffect callback
  const ctrls = useRef([...state.ctrls])
  const updates = useRef<any[]>([])

  // Backup of the most recently applied updates. The layout effect drains
  // `updates.current` after applying so a parent re-render with unchanged
  // deps doesn't re-apply stale entries (see #2376). StrictMode mounts
  // twice (mount → simulated unmount via `useOnce` cleanup → mount), and the
  // second mount needs to restart the controllers after they've been stopped,
  // so we keep this snapshot to fall back to. Reset each render so a snapshot
  // from a previous commit can never bleed into a subsequent layout effect.
  const strictModeRestartSnapshot = useRef<any[]>([])
  strictModeRestartSnapshot.current = []

  // Cache old controllers to dispose in the commit phase.
  const prevLength = usePrev(length) || 0

  // Create new controllers when "length" increases, and destroy
  // the affected controllers when "length" decreases.
  useMemo(() => {
    // Clean up any unused controllers
    each(ctrls.current.slice(length, prevLength), ctrl => {
      detachRefs(ctrl, ref)
      ctrl.stop(true)
    })
    ctrls.current.length = length

    declareUpdates(prevLength, length)
  }, [length])

  // Update existing controllers when "deps" are changed.
  useMemo(() => {
    declareUpdates(0, Math.min(prevLength, length))
    // @ts-expect-error – we want to allow passing undefined to useMemo
  }, deps)

  /** Fill the `updates` array with declarative updates for the given index range. */
  function declareUpdates(startIndex: number, endIndex: number) {
    for (let i = startIndex; i < endIndex; i++) {
      const ctrl =
        ctrls.current[i] ||
        (ctrls.current[i] = new Controller(null, state.flush))

      const update: UseSpringProps<any> = propsFn
        ? propsFn(i, ctrl)
        : (props as any)[i]

      if (update) {
        updates.current[i] = declareUpdate(update)
      }
    }
  }

  // New springs are created during render so users can pass them to
  // their animated components, but new springs aren't cached until the
  // commit phase (see the `useIsomorphicLayoutEffect` callback below).
  const springs = ctrls.current.map((ctrl, i) =>
    getSprings(ctrl, updates.current[i])
  )

  const context = useContext(SpringContext)
  const prevContext = usePrev(context)
  const hasContext = context !== prevContext && hasProps(context)

  // This is the commit phase where the new transition will begin.
  // - updated animation values will be passed to the controlers.
  // - state will be updated
  // - springs will start or the new update will be queued if the spring is not started yet.
  useIsomorphicLayoutEffect(() => {
    layoutId.current++

    // Replace the cached controllers.
    state.ctrls = ctrls.current

    // Flush the commit queue.
    const { queue } = state
    if (queue.length) {
      state.queue = []
      each(queue, cb => cb())
    }

    // Fall back to the restart snapshot when the primary array has been
    // consumed — this lets StrictMode's second mount re-apply updates after
    // the simulated cleanup stops the controllers.
    const activeUpdates =
      updates.current.length > 0
        ? updates.current
        : strictModeRestartSnapshot.current

    // Update existing controllers.
    each(ctrls.current, (ctrl, i) => {
      // Attach the controller to the local ref.
      ref?.add(ctrl)

      // Update the default props.
      if (hasContext) {
        ctrl.start({ default: context })
      }

      // Apply updates created during render.
      const update = activeUpdates[i]
      if (update) {
        // Update the injected ref if needed.
        replaceRef(ctrl, update.ref)

        // When an injected ref exists, the update is postponed
        // until the ref has its `start` method called.
        if (ctrl.ref) {
          // Push a shallow copy so `flushUpdate` mutations (e.g. wrapping event
          // handlers for batching) do not leak back into `updates.current[i]`,
          // which is reused across renders and StrictMode double-mounts.
          ctrl.queue.push({
            ...update,
            default: is.obj(update.default)
              ? { ...update.default }
              : update.default,
          })
        } else {
          ctrl.start(update)
        }
      }
    })

    // Snapshot updates before clearing so StrictMode's second mount can
    // still access them (see activeUpdates above).
    if (updates.current.length > 0) {
      strictModeRestartSnapshot.current = updates.current
    }
    updates.current = []
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
