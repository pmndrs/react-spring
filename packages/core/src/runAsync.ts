import { is, each, Pick } from 'shared'
import * as G from 'shared/globals'

import { matchProp, DEFAULT_PROPS, callProp } from './helpers'
import {
  AnimationResolver,
  AnimationResult,
  AsyncResult,
  ControllerUpdate,
  SpringChain,
  SpringDefaultProps,
  SpringProps,
  SpringStopFn,
  SpringToFn,
} from './types'

export interface RunAsyncProps<T = any> extends SpringProps<T> {
  callId: number
  cancel: boolean
  reset: boolean
  delay: number
  to?: any
}

export interface RunAsyncState<T> {
  /** The async function or array of spring props */
  asyncTo?: SpringChain<T> | SpringToFn<T>
  /** Resolves when the current `asyncTo` finishes or gets cancelled. */
  promise?: AsyncResult<T>
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
  getValue: () => T,
  getPaused: () => boolean,
  update: (props: any) => AsyncResult<T>,
  stop: SpringStopFn<T>
): AsyncResult<T> {
  if (props.cancel) {
    state.asyncTo = undefined
    return {
      value: getValue(),
      cancelled: true,
    }
  }
  // Wait for the previous async animation to be cancelled.
  else if (props.reset) {
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
    each(DEFAULT_PROPS, prop => {
      if (prop == 'onRest') return
      if (/function|object/.test(typeof props[prop])) {
        defaultProps[prop] = props[prop] as any
      }
    })

    const { callId, onRest } = props

    // Note: This function cannot be async, because `checkFailConditions` must be sync.
    const animate: any = (arg1: any, arg2?: any) => {
      // Prevent further animation if cancelled.
      if (callId <= (state.cancelId || 0)) {
        throw (result = { value: getValue(), cancelled: true })
      }
      // Prevent further animation if another "runAsync" call is active.
      if (to !== state.asyncTo) {
        throw (result = { value: getValue(), finished: false })
      }

      const props: ControllerUpdate<T> = is.obj(arg1)
        ? { ...arg1 }
        : { ...arg2, to: arg1 as any }

      each(defaultProps, (value, prop) => {
        if (is.und(props[prop])) {
          props[prop] = value as any
        }
      })

      const parentTo = state.asyncTo
      return update(props).then(async result => {
        if (state.asyncTo == null) {
          state.asyncTo = parentTo
        }

        if (getPaused()) {
          state.unpause = await new Promise(resolve => {
            state.unpause = resolve
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
        await to(animate, stop)
      }
      result = {
        value: getValue(),
        finished: true,
      }
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

//
// scheduleProps(props, state, action)
//

interface ScheduledProps<T> {
  key?: string
  props: Pick<SpringProps<T>, 'cancel' | 'reset' | 'delay'>
  state: { cancelId?: number }
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
    const delay = Math.max(0, callProp(props.delay || 0, key))
    if (delay > 0) G.frameLoop.setTimeout(run, delay)
    else run()

    function run() {
      let { cancel, reset } = props
      try {
        // Might have been cancelled during its delay.
        if (callId <= (state.cancelId || 0)) {
          cancel = true
        } else {
          cancel = matchProp(cancel, key)
          if (cancel) {
            state.cancelId = callId
          }
        }
        reset = !cancel && matchProp(reset, key)
        action({ ...props, callId, delay, cancel, reset }, resolve)
      } catch (err) {
        reject(err)
      }
    }
  })
}
