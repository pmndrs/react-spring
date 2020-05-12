import { is, each } from 'shared'
import * as G from 'shared/globals'

import { PAUSED } from './SpringPhase'
import { getDefaultProps } from './helpers'
import {
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
  parentId?: number
  cancel: boolean
  pause: boolean
  delay: number
  to?: any
}

export interface RunAsyncState<T> {
  pauseQueue: Set<() => void>
  resumeQueue: Set<() => void>
  asyncId?: number
  asyncTo?: SpringChain<T> | SpringToFn<T>
  promise?: AsyncResult<T>
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

  const { callId, parentId, onRest } = props
  const { asyncTo: prevTo, promise: prevPromise } = state

  if (!parentId && to === prevTo && !props.reset) {
    return prevPromise!
  }

  return (state.promise = (async (): AsyncResult<T> => {
    state.asyncId = callId
    state.asyncTo = to

    // The default props of any `animate` calls.
    const defaultProps = getDefaultProps<SpringDefaultProps<T>>(props, [
      // The `onRest` prop is only called when the `runAsync` promise is resolved.
      'onRest',
    ])

    let preventBail!: () => void
    let bail: (error: any) => void

    // This promise is rejected when the animation is interrupted.
    const bailPromise = new Promise<void>(
      (resolve, reject) => ((preventBail = resolve), (bail = reject))
    )

    // Stop animating when an error is caught.
    const withBailHandler = <Args extends any[]>(
      fn: (...args: Args) => AsyncResult<T>
    ) => (...args: Args) => {
      const onError = (err: any) => {
        if (err instanceof BailSignal) {
          bail(err) // Stop animating.
        }
        throw err
      }
      try {
        return fn(...args).catch(onError)
      } catch (err) {
        onError(err)
      }
    }

    const bailIfEnded = (bailSignal: BailSignal<T>) => {
      const bailResult =
        // The `cancel` prop or `stop` method was used.
        (callId <= (state.cancelId || 0) && getCancelledResult(target)) ||
        // The async `to` prop was replaced.
        (callId !== state.asyncId && getFinishedResult(target, false))

      if (bailResult) {
        bailSignal.result = bailResult
        throw bailSignal
      }
    }

    // Note: This function cannot use the `async` keyword, because we want the
    // `throw` statements to interrupt the caller.
    const animate: any = withBailHandler((arg1: any, arg2?: any) => {
      const bailSignal = new BailSignal()
      bailIfEnded(bailSignal)

      const props: any = is.obj(arg1) ? { ...arg1 } : { ...arg2, to: arg1 }
      props.parentId = callId

      each(defaultProps, (value, key) => {
        if (is.und(props[key])) {
          props[key] = value as any
        }
      })

      return target.start(props).then(async result => {
        bailIfEnded(bailSignal)

        if (target.is(PAUSED)) {
          await new Promise(resume => {
            state.resumeQueue.add(resume)
          })
        }

        return result
      })
    })

    let result!: AnimationResult<T>
    try {
      let animating!: Promise<void>

      // Async sequence
      if (is.arr(to)) {
        animating = (async (queue: any[]) => {
          for (const props of queue) {
            await animate(props)
          }
        })(to)
      }

      // Async script
      else if (is.fun(to)) {
        animating = Promise.resolve(
          to(animate, target.stop.bind(target) as any)
        )
      }

      await Promise.all([animating.then(preventBail), bailPromise])
      result = getFinishedResult(target, true)

      // Bail handling
    } catch (err) {
      if (err instanceof BailSignal) {
        result = err.result
      } else {
        throw err
      }

      // Reset the async state.
    } finally {
      if (callId == state.asyncId) {
        state.asyncId = parentId
        state.asyncTo = parentId ? prevTo : undefined
        state.promise = parentId ? prevPromise : undefined
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
  state.asyncId = state.asyncTo = state.promise = undefined
}

/** This error is thrown to signal an interrupted async animation. */
export class BailSignal<T = any> extends Error {
  result!: AnimationResult<T>
  constructor() {
    super(
      'An async animation has been interrupted. You see this error because you ' +
        'forgot to use `await` or `.catch(...)` on its returned promise.'
    )
  }
}
