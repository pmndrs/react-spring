import { Timeout, Globals as G } from '@react-spring/shared'
import { matchProp, callProp } from './helpers'
import { AsyncResult } from './types'
import { RunAsyncState, RunAsyncProps } from './runAsync'
import {
  AnimationResolver,
  AnimationTarget,
  InferProps,
} from './types/internal'

interface ScheduledProps<T extends AnimationTarget> {
  key?: string
  props: InferProps<T>
  state: RunAsyncState<T>
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
  { key, props, state, actions }: ScheduledProps<T>
): AsyncResult<T> {
  return new Promise((resolve, reject) => {
    let delay: number
    let timeout: Timeout

    let pause = false
    let cancel = matchProp(props.cancel, key)

    if (cancel) {
      onStart()
    } else {
      delay = callProp(props.delay || 0, key)
      pause = matchProp(props.pause, key)
      if (pause) {
        state.resumeQueue.add(onResume)
        actions.pause()
      } else {
        actions.resume()
        onResume()
      }
    }

    function onPause() {
      state.resumeQueue.add(onResume)
      state.timeouts.delete(timeout)
      timeout.cancel()
      // Cache the remaining delay.
      delay = timeout.time - G.now()
    }

    function onResume() {
      if (delay > 0) {
        timeout = G.frameLoop.setTimeout(onStart, delay)
        state.pauseQueue.add(onPause)
        state.timeouts.add(timeout)
      } else {
        onStart()
      }
    }

    function onStart() {
      state.pauseQueue.delete(onPause)
      state.timeouts.delete(timeout)

      // Maybe cancelled during its delay.
      if (callId <= (state.cancelId || 0)) {
        cancel = true
      }

      try {
        actions.start({ ...props, callId, delay, cancel, pause }, resolve)
      } catch (err) {
        reject(err)
      }
    }
  })
}
