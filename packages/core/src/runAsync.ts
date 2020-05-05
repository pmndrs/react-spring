import { is, each, Pick, Timeout } from 'shared'
import * as G from 'shared/globals'

import { matchProp, callProp, mergeDefaultProps, concatFn } from './helpers'
import {
  AnimationResolver,
  ControllerUpdate,
  SpringChain,
  SpringDefaultProps,
  SpringProps,
  SpringToFn,
} from './types'
import {
  getCancelledResult,
  getFinishedResult,
  AnimationResult,
  AsyncResult,
  AnimationTarget,
} from './AnimationResult'

export interface RunAsyncProps<T = any> extends SpringProps<T> {
  callId: number
  cancel: boolean
  pause: boolean
  delay: number
  to?: any
}

export interface RunAsyncState<T> {
  /** The async function or array of spring props */
  asyncTo?: SpringChain<T> | SpringToFn<T>
  /** Resolves when the current `asyncTo` finishes or gets cancelled. */
  promise?: AsyncResult<T>
  /** Call this to pause the `delay` prop */
  pause?: () => void
  /** Call this to unpause the current `asyncTo` function or array. */
  unpause?: () => void
  /** The last time we saw a matching `cancel` prop. */
  cancelId?: number
}

/**
 * Start an async chain or an async script.
 *
 * Always call `runAsync` in the action callback of a `scheduleProps` call.
 *
 * The `T` parameter can be a set of animated values (as an object type)
 * or a primitive type for a single animated value.
 */
export async function runAsync<T>(
  to: SpringChain<T> | SpringToFn<T>,
  props: RunAsyncProps<T>,
  state: RunAsyncState<T>,
  target: AnimationTarget<T>
): AsyncResult<T> {
  if (props.cancel) {
    // Stop the active `asyncTo` only on "default cancel".
    if (props.default) {
      state.asyncTo = undefined
    }
    return getCancelledResult(target)
  }
  if (props.pause) {
    await new Promise(next => {
      state.unpause = concatFn(state.unpause, () => {
        state.unpause = void 0
        next()
      })
    })
  }
  // Wait for the previous async animation to be cancelled.
  if (props.reset) {
    await state.promise
  }
  // Async animations are only replaced when "props.to" changes
  // or when "props.reset" equals true.
  else if (to === state.asyncTo) {
    return state.promise!
  }
  state.asyncTo = to
  return (state.promise = (async (): AsyncResult<T> => {
    let result!: AnimationResult

    const defaultProps: SpringDefaultProps<T> = {}
    mergeDefaultProps(defaultProps, props)

    // The `onRest` prop is for `runAsync` to call.
    defaultProps.onRest = undefined

    const { callId, onRest } = props
    const throwInvalidated = () => {
      // Prevent further animation if cancelled.
      if (callId <= (state.cancelId || 0)) {
        throw (result = getCancelledResult(target))
      }
      // Prevent further animation if another "runAsync" call is active.
      if (to !== state.asyncTo) {
        throw (result = getFinishedResult(target, false))
      }
    }

    // Note: This function cannot use the `async` keyword, because we want the
    // `throw` statements to interrupt the caller.
    const animate: any = (arg1: any, arg2?: any) => {
      throwInvalidated()

      const props: ControllerUpdate<T> = is.obj(arg1)
        ? { ...arg1 }
        : { ...arg2, to: arg1 as any }

      each(defaultProps, (value, prop) => {
        if (is.und(props[prop])) {
          props[prop] = value as any
        }
      })

      const parentTo = state.asyncTo
      return target.start(props).then(async result => {
        throwInvalidated()

        if (state.asyncTo == null) {
          state.asyncTo = parentTo
        }

        if (target.is('PAUSED')) {
          await new Promise(resolve => {
            state.unpause = concatFn(state.unpause, () => {
              state.unpause = void 0
              resolve()
            })
          })
        }

        return result
      })
    }

    try {
      // Async sequence
      if (is.arr(to)) {
        for (const props of to) {
          await animate(props)
        }
      }
      // Async script
      else if (is.fun(to)) {
        await to(animate, target.stop.bind(target) as any)
      }
      result = getFinishedResult(target, true)
    } catch (err) {
      if (err !== result) {
        throw err
      }
    } finally {
      state.promise = undefined
      if (to == state.asyncTo) {
        state.asyncTo = undefined
      }
    }

    if (is.fun(onRest)) {
      G.batchedUpdates(() => {
        onRest(result)
      })
    }

    return result
  })())
}

export function cancelAsync(state: RunAsyncState<any>, callId: number) {
  state.cancelId = callId
  state.asyncTo = undefined
}

//
// scheduleProps(props, state, action)
//

interface ScheduledProps<T> {
  key?: string
  props: Pick<SpringProps<T>, 'cancel' | 'pause' | 'delay'>
  state: RunAsyncState<T>
  action: (props: RunAsyncProps<T>, resolve: AnimationResolver<T>) => void
}

/**
 * Pass a copy of the given props to an `action` after any delay is finished
 * and the props weren't cancelled before then.
 */
export function scheduleProps<T>(
  callId: number,
  { key, props, state, action }: ScheduledProps<T>
): AsyncResult<T> {
  return new Promise((resolve, reject) => {
    let delay = 0
    let pause = false

    let cancel = matchProp(props.cancel, key)
    if (cancel) {
      state.cancelId = callId
      return next()
    }

    pause = matchProp(props.pause, key)
    delay = Math.max(0, callProp(props.delay || 0, key))
    if (delay > 0) {
      let timeout: Timeout
      const onPause = () => {
        state.pause = void 0
        state.unpause = concatFn(state.unpause, onResume)
        timeout.cancel()
        delay = Math.max(0, timeout.time - G.now())
      }
      const onResume = () => {
        state.unpause = void 0
        state.pause = concatFn(state.pause, onPause)
        timeout = G.frameLoop.setTimeout(next, delay)
      }
      if (pause) {
        state.unpause = concatFn(state.unpause, onResume)
      } else {
        timeout = G.frameLoop.setTimeout(next, delay)
        state.pause = concatFn(state.pause, onPause)
      }
    } else {
      next()
    }

    function next() {
      if (delay > 0) {
        state.pause = void 0
      }
      // Maybe cancelled during its delay.
      if (callId <= (state.cancelId || 0)) {
        cancel = true
      }
      try {
        action({ ...props, callId, delay, cancel, pause }, resolve)
      } catch (err) {
        reject(err)
      }
    }
  })
}
