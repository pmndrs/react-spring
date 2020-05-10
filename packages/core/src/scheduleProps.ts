import { matchProp, callProp } from './helpers'
import { RunAsyncState, RunAsyncProps } from './runAsync'
import { SpringProps, AnimationResolver } from './types'
import { AsyncResult } from './AnimationResult'
import { Timeout, Globals as G } from 'shared'

interface ScheduledProps<T> {
  key?: string
  props: Pick<SpringProps<T>, 'cancel' | 'pause' | 'delay'>
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
export function scheduleProps<T>(
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
      timeout.cancel()
      // Cache the remaining delay.
      delay = timeout.time - G.now()
    }

    function onResume() {
      if (delay > 0) {
        state.pauseQueue.add(onPause)
        timeout = G.frameLoop.setTimeout(onStart, delay)
      } else {
        onStart()
      }
    }

    function onStart() {
      state.pauseQueue.delete(onPause)

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
