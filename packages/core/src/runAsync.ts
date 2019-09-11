import { is } from '@react-spring/shared'
import * as G from 'shared/globals'

import {
  AsyncTo,
  SpringUpdate,
  SpringUpdateFn,
  SpringStopFn,
  SpringProps,
} from './types/spring'
import { AnimationResult } from './SpringValue'

export type AsyncResult<T> = Promise<AnimationResult<T>>

export interface RunAsyncState<T, P extends string = string> {
  /** The async function or array of spring props */
  asyncTo?: AsyncTo<T, P>
  /** Resolves when the current `asyncTo` finishes or gets cancelled. */
  promise?: AsyncResult<T>
  /** Call this to unpause the current `asyncTo` function or array. */
  unpause?: () => void
  /** The last time we saw a matching `cancel` prop. */
  cancel?: number
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/** Start an async chain or an async script. */
export async function runAsync<T, P extends string = string>(
  to: AsyncTo<T, P>,
  props: SpringProps<T, P>,
  state: RunAsyncState<T, P>,
  getValue: () => T,
  getPaused: () => boolean,
  update: SpringUpdateFn<T, P>,
  stop: SpringStopFn<T>
): AsyncResult<T> {
  const timestamp = G.now()
  if (is.num(props.delay) && props.delay > 0) {
    await sleep(props.delay)
  }
  if (props.cancel === true) {
    // This cancels the entire stack of "runAsync" calls.
    state.cancel = timestamp
  }
  // Might get cancelled before delay ends.
  if (timestamp <= (state.cancel || 0)) {
    return {
      finished: false,
      value: getValue(),
    }
  }
  if (props.reset) {
    // Use "state.cancel" for resets too.
    state.cancel = timestamp
    await state.promise
  }
  // Unchanged "to" prop is a no-op (except with "reset: true")
  else if (to === state.asyncTo) {
    return state.promise!
  }
  state.asyncTo = to
  return (state.promise = (async (): AsyncResult<T> => {
    const cancelToken = Symbol.for('spring:async:cancel')
    const isCancelled = () =>
      to !== state.asyncTo || timestamp < (state.cancel || 0)

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

    let last: AsyncResult<T> | undefined
    const animate = (props: SpringUpdate<T, P>) =>
      handleInterrupts().then(async () => {
        const { to } = props as any
        if (is.fun(to) || is.arr(to)) {
          const parentTo = state.asyncTo
          last = runAsync(
            to,
            props as any,
            state,
            getValue,
            getPaused,
            update,
            stop
          ).then(result => {
            if (state.asyncTo == null) {
              state.asyncTo = parentTo
            }
            return result
          })
        } else {
          last = update(props)
        }
        const result = await last
        await handleInterrupts()
        return result
      })

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
      return {
        finished: true,
        value: getValue(),
      }
    } catch (err) {
      if (err !== cancelToken) {
        state.promise = undefined
        throw err
      }
      return {
        finished: false,
        value: getValue(),
      }
    } finally {
      if (to == state.asyncTo) {
        state.asyncTo = undefined
      }
    }
  })())
}
