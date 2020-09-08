import { Timeout, Globals as G, is } from '@react-spring/shared'
import { matchProp, callProp, getDefaultProp } from './helpers'
import { AsyncResult, MatchProp } from './types'
import { RunAsyncState, RunAsyncProps } from './runAsync'
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
  props: InferProps<T>
  defaultProps?: DefaultProps<InferState<T>>
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
  { key, props, defaultProps, state, actions }: ScheduledProps<T>
): AsyncResult<T> {
  return new Promise((resolve, reject) => {
    let delay: number
    let timeout: Timeout

    let cancel = mergeDefaultProp(defaultProps, props, 'cancel')
    cancel = matchProp(props.cancel ?? cancel, key)

    if (cancel) {
      onStart()
    } else {
      // The `pause` prop updates the paused flag.
      if (!is.und(props.pause)) {
        state.paused = matchProp(props.pause, key)
      }
      // The default `pause` takes precedence when true,
      // which allows `SpringContext` to work as expected.
      let pause = mergeDefaultProp(defaultProps, props, 'pause')
      if (pause !== true) {
        pause = state.paused || matchProp(pause, key)
      }

      delay = callProp(props.delay || 0, key)
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
        actions.start({ ...props, callId, cancel }, resolve)
      } catch (err) {
        reject(err)
      }
    }
  })
}

/** Update and return the default prop. */
function mergeDefaultProp<T>(
  defaultProps: DefaultProps<T> | undefined,
  props: DefaultProps<T>,
  key: keyof DefaultProps<T>
) {
  let value: any
  return (
    defaultProps &&
    (is.und((value = getDefaultProp(props, key)))
      ? defaultProps[key]
      : (defaultProps[key] = value))
  )
}
