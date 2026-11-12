import { Timeout, is, raf, Globals as G } from '@react-spring/shared'
import { matchProp, callProp } from './helpers'
import { AsyncResult, MatchProp } from './types'
import { RunAsyncState, RunAsyncProps } from './runAsync'
import { getCancelledResult, getFinishedResult } from './AnimationResult'
import {
  AnimationResolver,
  AnimationTarget,
  InferProps,
  InferState,
} from './types/internal'

// The `scheduleProps` function only handles these defaults.
type DefaultProps<T> = { cancel?: MatchProp<T>; pause?: MatchProp<T> }

interface ScheduledProps<T extends AnimationTarget> {
  key?: string
  target: T
  props: InferProps<T>
  defaultProps?: DefaultProps<InferState<T>>
  state: RunAsyncState<T>
  getStoppedResult?: () => AsyncResult<T> | undefined
  actions: {
    pause: () => void
    resume: () => void
    start: (props: RunAsyncProps<T>, resolve: AnimationResolver<T>) => void
  }
}

/**
 * This function sets a timeout if both the `delay` prop exists and
 * the `cancel` prop is not `true`.
 *
 * The `actions.start` function must handle the `cancel` prop itself,
 * but the `pause` prop is taken care of.
 */
export function scheduleProps<T extends AnimationTarget>(
  callId: number,
  {
    key,
    target,
    props,
    defaultProps,
    state,
    actions,
    getStoppedResult,
  }: ScheduledProps<T>
): AsyncResult<T> {
  return new Promise((resolve, reject) => {
    let delay: number
    let timeout: Timeout
    let started = false

    let cancel: boolean
    try {
      cancel = matchProp(props.cancel ?? defaultProps?.cancel, key)
      const stopped = getStoppedResult?.()
      if (cancel) {
        onStart()
      } else if (stopped) {
        resolve(stopped)
      } else {
        ;(state.stopQueue ||= new Set()).add(onStop)

        // The `pause` prop updates the paused flag.
        if (!is.und(props.pause)) {
          const paused = matchProp(props.pause, key)
          if (started) return
          state.paused = paused
        }
        // The default `pause` takes precedence when true,
        // which allows `SpringContext` to work as expected.
        let pause = defaultProps?.pause
        if (pause !== true) {
          pause = state.paused || matchProp(pause, key)
        }

        if (started) return
        delay = callProp(props.delay || 0, key)
        if (started) return
        if (pause) {
          state.resumeQueue.add(onResume)
          actions.pause()
        } else {
          actions.resume()
          onResume()
        }
      }
    } catch (error) {
      if (state.stopQueue?.has(onStop)) cleanup()
      started = true
      reject(error)
    }

    function onPause() {
      if (started) return
      state.resumeQueue.add(onResume)
      state.timeouts.delete(timeout)
      timeout.cancel()
      // Cache the remaining delay.
      delay = timeout.time - raf.now()
    }

    function onResume() {
      if (started) return
      if (delay > 0 && !G.skipAnimation) {
        state.delayed = true
        timeout = raf.setTimeout(onStart, delay)
        state.pauseQueue.add(onPause)
        state.timeouts.add(timeout)
      } else {
        onStart()
      }
    }

    function cleanup() {
      state.stopQueue?.delete(onStop)
      state.resumeQueue.delete(onResume)
      state.pauseQueue.delete(onPause)
      state.timeouts.delete(timeout)
      timeout?.cancel()
      state.delayed = false
    }

    function onStop(cancelled: boolean) {
      if (started) return
      started = true
      cleanup()
      resolve(
        cancelled
          ? getCancelledResult(target.get())
          : getFinishedResult(target.get(), false)
      )
    }

    function onStart() {
      if (started) return
      started = true
      cleanup()
      // Maybe cancelled during its delay.
      if (callId <= (state.cancelId || 0)) {
        cancel = true
      }

      try {
        actions.start({ ...props, callId, cancel }, resolve)
      } catch (err) {
        reject(err)
      }
    }
  })
}
