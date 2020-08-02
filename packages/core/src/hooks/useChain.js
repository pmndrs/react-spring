import { useLayoutEffect } from 'react-layout-effect'
import { each } from '@react-spring/shared'

/** API
 *  useChain(references, timeSteps, timeFrame)
 */

export function useChain(refs, timeSteps, timeFrame = 1000) {
  useLayoutEffect(() => {
    if (timeSteps) {
      let prevDelay = 0
      each(refs, (ref, i) => {
        if (!ref.current) return

        const { controllers } = ref.current
        if (controllers.length) {
          let delay = timeFrame * timeSteps[i]

          // Use the previous delay if none exists.
          if (isNaN(delay)) delay = prevDelay
          else prevDelay = delay

          each(controllers, ctrl => {
            each(ctrl.queue, props => {
              props.delay = delay + (props.delay || 0)
            })
            ctrl.start()
          })
        }
      })
    } else {
      let p = Promise.resolve()
      each(refs, ref => {
        const { controllers, start } = ref.current || {}
        if (controllers && controllers.length) {
          // Take the queue of each controller
          const updates = controllers.map(ctrl => {
            const q = ctrl.queue
            ctrl.queue = []
            return q
          })

          // Apply the queue when the previous ref stops animating
          p = p.then(() => {
            each(controllers, (ctrl, i) => ctrl.queue.push(...updates[i]))
            return start()
          })
        }
      })
    }
  })
}
