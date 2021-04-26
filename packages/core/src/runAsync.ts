import {
  is,
  raf,
  flush,
  eachProp,
  Timeout,
  Globals as G,
} from '@react-spring/shared'
import { Falsy } from '@react-spring/types'

import { getDefaultProps } from './helpers'
import { AnimationTarget, InferState, InferProps } from './types/internal'
import { AnimationResult, AsyncResult, SpringChain, SpringToFn } from './types'
import { getCancelledResult, getFinishedResult } from './AnimationResult'

type AsyncTo<T> = SpringChain<T> | SpringToFn<T>

/** @internal */
export type RunAsyncProps<T extends AnimationTarget = any> = InferProps<T> & {
  callId: number
  parentId?: number
  cancel: boolean
  to?: any
}

/** @internal */
export interface RunAsyncState<T extends AnimationTarget = any> {
  paused: boolean
  pauseQueue: Set<() => void>
  resumeQueue: Set<() => void>
  timeouts: Set<Timeout>
  asyncId?: number
  asyncTo?: AsyncTo<InferState<T>>
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
export function runAsync<T extends AnimationTarget>(
  to: AsyncTo<InferState<T>>,
  props: RunAsyncProps<T>,
  state: RunAsyncState<T>,
  target: T
): AsyncResult<T> {
  const { callId, parentId, onRest } = props
  const { asyncTo: prevTo, promise: prevPromise } = state

  if (!parentId && to === prevTo && !props.reset) {
    return prevPromise!
  }

  return (state.promise = (async () => {
    state.asyncId = callId
    state.asyncTo = to

    // The default props of any `animate` calls.
    const defaultProps = getDefaultProps<InferProps<T>>(props, (value, key) =>
      // The `onRest` prop is only called when the `runAsync` promise is resolved.
      key === 'onRest' ? undefined : value
    )

    let preventBail!: () => void
    let bail: (error: any) => void

    // This promise is rejected when the animation is interrupted.
    const bailPromise = new Promise<void>(
      (resolve, reject) => ((preventBail = resolve), (bail = reject))
    )

    const bailIfEnded = (bailSignal: BailSignal) => {
      const bailResult =
        // The `cancel` prop or `stop` method was used.
        (callId <= (state.cancelId || 0) && getCancelledResult(target)) ||
        // The async `to` prop was replaced.
        (callId !== state.asyncId && getFinishedResult(target, false))

      if (bailResult) {
        bailSignal.result = bailResult

        // Reject the `bailPromise` to ensure the `runAsync` promise
        // is not relying on the caller to rethrow the error for us.
        bail(bailSignal)
        throw bailSignal
      }
    }

    const animate: any = (arg1: any, arg2?: any) => {
      // Create the bail signal outside the returned promise,
      // so the generated stack trace is relevant.
      const bailSignal = new BailSignal()
      const skipAnimationSignal = new SkipAniamtionSignal()

      return (async () => {
        if (G.skipAnimation) {
          /**
           * We need to stop animations if `skipAnimation`
           * is set in the Globals
           *
           */
          stopAsync(state)

          // create the rejection error that's handled gracefully
          skipAnimationSignal.result = getFinishedResult(target, false)
          bail(skipAnimationSignal)
          throw skipAnimationSignal
        }

        bailIfEnded(bailSignal)

        const props: any = is.obj(arg1) ? { ...arg1 } : { ...arg2, to: arg1 }
        props.parentId = callId

        eachProp(defaultProps, (value, key) => {
          if (is.und(props[key])) {
            props[key] = value
          }
        })

        const result = await target.start(props)
        bailIfEnded(bailSignal)

        if (state.paused) {
          await new Promise<void>(resume => {
            state.resumeQueue.add(resume)
          })
        }

        return result
      })()
    }

    let result!: AnimationResult<T>

    if (G.skipAnimation) {
      /**
       * We need to stop animations if `skipAnimation`
       * is set in the Globals
       */
      stopAsync(state)
      return getFinishedResult(target, false)
    }

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
      else {
        animating = Promise.resolve(to(animate, target.stop.bind(target)))
      }

      await Promise.all([animating.then(preventBail), bailPromise])
      result = getFinishedResult(target.get(), true, false)

      // Bail handling
    } catch (err) {
      if (err instanceof BailSignal) {
        result = err.result
      } else if (err instanceof SkipAniamtionSignal) {
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
      raf.batchedUpdates(() => {
        onRest(result, target, target.item)
      })
    }

    return result
  })())
}

/** Stop the current `runAsync` call with `finished: false` (or with `cancelled: true` when `cancelId` is defined) */
export function stopAsync(state: RunAsyncState, cancelId?: number | Falsy) {
  flush(state.timeouts, t => t.cancel())
  state.pauseQueue.clear()
  state.resumeQueue.clear()
  state.asyncId = state.asyncTo = state.promise = undefined
  if (cancelId) state.cancelId = cancelId
}

/** This error is thrown to signal an interrupted async animation. */
export class BailSignal extends Error {
  result!: AnimationResult
  constructor() {
    super(
      'An async animation has been interrupted. You see this error because you ' +
        'forgot to use `await` or `.catch(...)` on its returned promise.'
    )
  }
}

export class SkipAniamtionSignal extends Error {
  result!: AnimationResult

  constructor() {
    super('SkipAnimationSignal')
  }
}
