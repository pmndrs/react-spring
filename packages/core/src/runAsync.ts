import { is, each, Merge } from 'shared'

import {
  AsyncTo,
  SpringUpdateFn,
  SpringStopFn,
  SpringProps,
  SpringTo,
} from './types/spring'
import { AnimationResult } from './types/animated'
import { matchProp, DEFAULT_PROPS } from './helpers'
import { PendingProps, SpringValue } from './SpringValue'

export type AsyncResult<T = any> = Promise<AnimationResult<T>>

export type RunAsyncProps<T = any> = unknown &
  Merge<
    PendingProps<T>,
    {
      asyncId: number
      cancel: boolean
      reset: boolean
      onAnimate?: (props: RunAsyncProps<T>, spring: SpringValue<T>) => void
    }
  >

export interface RunAsyncState<T> {
  /** The spring name */
  key?: string
  /** The async function or array of spring props */
  asyncTo?: AsyncTo<T>
  /** Resolves when the current `asyncTo` finishes or gets cancelled. */
  promise?: AsyncResult<T>
  /** Call this to unpause the current `asyncTo` function or array. */
  unpause?: () => void
  /** The last time we saw a matching `cancel` prop. */
  cancelId?: number
}

/** Default props for a `SpringValue` object */
export type DefaultProps = {
  [D in (typeof DEFAULT_PROPS)[number]]?: RunAsyncProps[D]
}

/**
 * Start an async chain or an async script.
 *
 * You should always wrap `runAsync` calls with `scheduleProps` so that
 * you have access to `RunAsyncProps` instead of the usual `SpringProps`.
 *
 * The `T` parameter can be a set of animated values (as an object type)
 * or a primitive type for a single animated value.
 */
export async function runAsync<T>(
  to: AsyncTo<T>,
  props: RunAsyncProps<T>,
  state: RunAsyncState<T>,
  getValue: () => T,
  getPaused: () => boolean,
  update: SpringUpdateFn<any>,
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
    const { asyncId } = props
    const cancelToken = Symbol.for('cancel')
    const isCancelled = () =>
      to !== state.asyncTo || asyncId <= (state.cancelId || 0)

    const defaultProps: DefaultProps = {}
    each(DEFAULT_PROPS, prop => {
      if (prop == 'onRest') return
      if (/function|object/.test(typeof props[prop])) {
        defaultProps[prop] = props[prop] as any
      }
    })

    const animate = (
      arg1: SpringTo<T> | SpringProps<T>,
      arg2?: SpringProps<T>
    ) => {
      if (isCancelled()) {
        throw cancelToken
      }

      type AnimateProps = SpringProps<T> & typeof defaultProps
      const props: AnimateProps = is.obj(arg1)
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

        if (isCancelled()) {
          throw cancelToken
        }

        if (getPaused()) {
          await new Promise(resolve => {
            state.unpause = resolve
          })
          state.unpause = undefined
        }

        return result
      })
    }

    let result: AnimationResult<T>
    try {
      // Async sequence
      if (is.arr(to)) {
        for (const props of to) {
          await animate(props)
        }
      }
      // Async script
      else if (is.fun(to)) {
        await to(animate as any, stop)
      }
      result = {
        value: getValue(),
        finished: true,
      }
    } catch (err) {
      if (err !== cancelToken) {
        throw err
      }
      result = {
        value: getValue(),
        cancelled: true,
      }
    } finally {
      state.promise = undefined
      if (to == state.asyncTo) {
        state.asyncTo = undefined
      }
    }
    if (props.onRest) {
      props.onRest(result as any)
    }
    return result
  })())
}

//
// scheduleProps(props, state, action)
//

/**
 * Pass props to your action when any delay is finished and the
 * props weren't cancelled before then.
 */
export function scheduleProps<Props extends SpringProps, Result>(
  asyncId: number,
  props: Props,
  state: { key?: string; cancelId?: number },
  action: (
    props: Props & RunAsyncProps,
    resolve: (result: Result | Promise<Result>) => void
  ) => void
): Promise<Result> {
  return new Promise((resolve, reject) => {
    let { delay, cancel, reset } = props

    if (is.num(delay) && delay > 0) {
      setTimeout(run, delay)
    } else run()

    function run() {
      // Might be cancelled during delay.
      if (asyncId <= (state.cancelId || 0)) {
        cancel = true
      } else {
        cancel = matchProp(cancel, state.key)
        if (cancel) {
          state.cancelId = asyncId
        }
      }
      reset = !cancel && matchProp(reset, state.key)
      try {
        action({ ...props, asyncId, cancel, reset }, resolve)
      } catch (err) {
        reject(err)
      }
    }
  })
}
