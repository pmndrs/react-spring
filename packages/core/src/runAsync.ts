import { is, each } from 'shared'
import * as G from 'shared/globals'

import { mergeDefaultProps } from './helpers'
import {
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
  /** Functions to be called once paused */
  pauseQueue: Set<Function>
  /** Functions to be called once resumed */
  resumeQueue: Set<Function>
  /** The async function or array of spring props */
  asyncTo?: SpringChain<T> | SpringToFn<T>
  /** Resolves when the current `asyncTo` finishes or gets cancelled. */
  promise?: AsyncResult<T>
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
  if (props.pause) {
    await new Promise(resume => {
      state.resumeQueue.add(resume)
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
    mergeDefaultProps(defaultProps, props, ['onRest'])

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
          await new Promise(resume => {
            state.resumeQueue.add(resume)
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
