import { is, each } from 'shared'

import {
  AsyncTo,
  SpringUpdate,
  SpringUpdateFn,
  SpringStopFn,
  SpringProps,
} from './types/spring'
import { AnimationResult, PendingProps } from './SpringValue'
import { matchProp, DEFAULT_PROPS } from './helpers'

export type AsyncResult<T = any> = Promise<AnimationResult<T>>

export type RunAsyncProps<T> = PendingProps<T> & {
  asyncId: number
  cancel: boolean
  reset: boolean
}

export interface RunAsyncState<T, P extends string = string> {
  /** The spring name */
  key?: P | undefined
  /** The async function or array of spring props */
  asyncTo?: AsyncTo<T, P>
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
 * You should always wrap `runAsync` calls with `scheduleProps` so that
 * you have access to `RunAsyncProps` instead of the usual `SpringProps`.
 */
export async function runAsync<T, P extends string = string>(
  to: AsyncTo<T, P>,
  props: RunAsyncProps<T>,
  state: RunAsyncState<T, P>,
  getValue: () => T,
  getPaused: () => boolean,
  update: SpringUpdateFn<T, P>,
  stop: SpringStopFn<T>
): AsyncResult<T> {
  if (props.cancel) {
    state.asyncTo = undefined
    return {
      value: getValue(),
      cancelled: true,
    }
  }
  // Unchanged "to" prop is a no-op (except with "reset: true")
  else if (props.reset) {
    await state.promise
  } else if (to === state.asyncTo) {
    return state.promise!
  }
  state.asyncTo = to
  return (state.promise = (async (): AsyncResult<T> => {
    const { asyncId } = props
    const cancelToken = Symbol.for('cancel')
    const isCancelled = () =>
      to !== state.asyncTo || asyncId < (state.cancelId || 0)

    const handleInterrupts = async () => {
      if (isCancelled()) {
        throw cancelToken
      }
      if (getPaused()) {
        await new Promise(resolve => {
          state.unpause = resolve
        })
        state.unpause = undefined
      }
    }

    const defaultProps: any = {}
    each(DEFAULT_PROPS, prop => {
      if (prop == 'onRest') return
      if (/function|object/.test(typeof props[prop])) {
        defaultProps[prop] = props[prop]
      }
    })

    // TODO: remove "& any" when negated types are released
    const animate = (props: SpringUpdate<T, P> & any) =>
      handleInterrupts().then(async () => {
        props = is.obj(props) ? { ...props } : { to: props }
        each(defaultProps, (value, prop) => {
          if (is.und(props[prop])) {
            props[prop] = value
          }
        })
        const parentTo = state.asyncTo
        const result = await update(props)
        if (state.asyncTo == null) {
          state.asyncTo = parentTo
        }
        await handleInterrupts()
        return result
      })

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
        state.promise = undefined
        throw err
      }
      result = {
        value: getValue(),
        cancelled: true,
      }
    } finally {
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

export function scheduleProps<T, U>(
  asyncId: number,
  props: SpringProps<T>,
  state: { key?: string; cancelId?: number },
  action: (
    props: RunAsyncProps<T>,
    resolve: (result: U | Promise<U>) => void
  ) => void
): Promise<U> {
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
