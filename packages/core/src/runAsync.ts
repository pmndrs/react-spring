import { is, each, Merge } from 'shared'

import {
  AsyncTo,
  SpringUpdateFn,
  SpringStopFn,
  SpringUpdate,
  SpringTo,
} from './types/spring'
import { AnimationResult } from './types/animated'
import { matchProp, DEFAULT_PROPS, callProp, MatchProp } from './helpers'
import { PendingProps } from './SpringValue'

export type AsyncResult<T = any> = Promise<Readonly<AnimationResult<T>>>

export type RunAsyncProps<T = any> = unknown &
  Merge<
    PendingProps<T>,
    {
      asyncId: number
      cancel: boolean
      reset: boolean
    }
  >

export interface RunAsyncState<T> {
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
  [D in typeof DEFAULT_PROPS[number]]?: RunAsyncProps[D]
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
    let result!: AnimationResult

    const { asyncId } = props
    const checkFailConditions = () => {
      if (to !== state.asyncTo) {
        throw (result = { value: getValue(), finished: false })
      }
      if (asyncId <= (state.cancelId || 0)) {
        throw (result = { value: getValue(), cancelled: true })
      }
    }

    const defaultProps: DefaultProps = {}
    each(DEFAULT_PROPS, prop => {
      if (prop == 'onRest') return
      if (/function|object/.test(typeof props[prop])) {
        defaultProps[prop] = props[prop] as any
      }
    })

    const animate = (
      arg1: SpringTo<T> | SpringUpdate<T>,
      arg2?: SpringUpdate<T>
    ) => {
      checkFailConditions()

      type AnimateProps = SpringUpdate<T> & typeof defaultProps
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

        checkFailConditions()

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
        await to(animate as any, stop)
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

    if (is.fun(props.onRest)) {
      props.onRest(result)
    }

    if (result.finished) {
      // TODO: support { delay: 1000 } return value
      const loop = callProp(props.loop)
      if (loop) {
        return runAsync(to, props, state, getValue, getPaused, update, stop)
      }
    }

    return result
  })())
}

//
// scheduleProps(props, state, action)
//

interface ScheduledProps<T> {
  key?: string
  props: {
    cancel?: MatchProp
    delay?: number | ((key: string) => number)
    reset?: MatchProp
  }
  state: {
    cancelId?: number
  }
  action: (
    props: RunAsyncProps<T>,
    resolve: (result: AnimationResult<T> | AsyncResult<T>) => void
  ) => void
}

/**
 * Pass a copy of the given props to an `action` after any delay is finished
 * and the props weren't cancelled before then.
 */
export function scheduleProps<T>(
  asyncId: number,
  { key, props, state, action }: ScheduledProps<T>
): AsyncResult<T> {
  return new Promise((resolve, reject) => {
    let { delay, cancel, reset } = props

    if (is.num(delay) && delay > 0) {
      setTimeout(run, delay)
    } else run()

    function run() {
      try {
        // Might have been cancelled during its delay.
        if (asyncId <= (state.cancelId || 0)) {
          cancel = true
        } else {
          cancel = matchProp(cancel, key)
          if (cancel) {
            state.cancelId = asyncId
          }
        }
        reset = !cancel && matchProp(reset, key)
        action({ ...props, asyncId, cancel, reset }, resolve)
      } catch (err) {
        reject(err)
      }
    }
  })
}
