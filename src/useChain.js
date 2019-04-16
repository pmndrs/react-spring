import { useEffect } from 'react'

/** API
 *  useChain(references, timeSteps, timeFrame)
 */

export function useChain(refs, timeSteps, timeFrame = 1000) {
  useEffect(() => {
    if (timeSteps) {
      let prevDelay = 0
      refs.forEach((ref, i) => {
        if (!ref.current) return

        const { controllers } = ref.current
        if (controllers.length) {
          let delay = timeFrame * timeSteps[i]

          // Use the previous delay if none exists.
          if (isNaN(delay)) delay = prevDelay
          else prevDelay = delay

          controllers.forEach(ctrl => {
            ctrl.queue.forEach(props => (props.delay += delay))
            ctrl.start()
          })
        }
      })
    } else {
      let p = Promise.resolve()
      refs.forEach(ref => {
        if (!ref.current) return

        const { controllers, start } = ref.current
        if (controllers.length) {
          // Take the queue of each controller
          const updates = controllers.map(ctrl => {
            const q = ctrl.queue
            ctrl.queue = []
            return q
          })

          // Apply the queue when the previous ref stops animating
          p = p.then(() => {
            controllers.forEach((ctrl, i) => ctrl.queue.push(...updates[i]))
            return start()
          })
        }
      })
    }
  })
}
