import { each, useLayoutEffect } from '@react-spring/shared'
import { SpringRef } from '../SpringRef'
import { callProp } from '../helpers'

export function useChain(
  refs: ReadonlyArray<SpringRef>,
  timeSteps?: number[],
  timeFrame = 1000
) {
  useLayoutEffect(() => {
    if (timeSteps) {
      let prevDelay = 0
      each(refs, (ref, i) => {
        const controllers = ref.current
        if (controllers.length) {
          let delay = timeFrame * timeSteps[i]

          // Use the previous delay if none exists.
          if (isNaN(delay)) delay = prevDelay
          else prevDelay = delay

          each(controllers, ctrl => {
            each(ctrl.queue, props => {
              // memoizing stops recursion #1367
              const memoizedDelayProp = props.delay
              props.delay = key => delay + callProp(memoizedDelayProp || 0, key)
            })
            ctrl.start()
          })
        }
      })
    } else {
      let p: Promise<any> = Promise.resolve()
      each(refs, ref => {
        const controllers = ref.current
        if (controllers.length) {
          // Take the queue of each controller
          const queues = controllers.map(ctrl => {
            const q = ctrl.queue
            ctrl.queue = []
            return q
          })

          // Apply the queue when the previous ref stops animating
          p = p.then(() => {
            each(controllers, (ctrl, i) =>
              each(queues[i] || [], update => ctrl.queue.push(update))
            )
            return ref.start()
          })
        }
      })
    }
  })
}
