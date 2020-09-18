import { useLayoutEffect } from 'react-layout-effect'
import { each } from '@react-spring/shared'
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
        if (!ref.current) return

        const controllers = ref.current
        if (controllers.size) {
          let delay = timeFrame * timeSteps[i]

          // Use the previous delay if none exists.
          if (isNaN(delay)) delay = prevDelay
          else prevDelay = delay

          each(controllers, ctrl => {
            each(ctrl.queue, props => {
              props.delay = key => delay + callProp(props.delay || 0, key)
            })
            ctrl.start()
          })
        }
      })
    } else {
      let p: Promise<any> = Promise.resolve()
      each(refs, ref => {
        const controllers = Array.from(ref.current)
        if (controllers.length) {
          // Take the queue of each controller
          const updates = controllers.map(ctrl => {
            const q = ctrl.queue
            ctrl.queue = []
            return q
          })

          // Apply the queue when the previous ref stops animating
          p = p.then(() => {
            each(controllers, (ctrl, i) => ctrl.queue.push(...updates[i]))
            return ref.start()
          })
        }
      })
    }
  })
}
