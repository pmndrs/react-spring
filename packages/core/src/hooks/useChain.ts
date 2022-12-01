import { each, useIsomorphicLayoutEffect } from '@react-spring/shared'
import { SpringRef } from '../SpringRef'
import { callProp } from '../helpers'

/**
 * Used to orchestrate animation hooks in sequence with one another.
 * This is best used when you specifically want to orchestrate different
 * types of animation hook e.g. `useSpring` & `useTransition` in
 * sequence as opposed to multiple `useSpring` hooks.
 *
 *
 * ```jsx
 * export const MyComponent = () => {
 *  //...
 *  useChain([springRef, transitionRef])
 *  //...
 * }
 * ```
 *
 * @param refs – An array of `SpringRef`s.
 * @param timeSteps – Optional array of numbers that define the
 * delay between each animation from 0-1. The length should correlate
 * to the length of `refs`.
 * @param timeFrame – Optional number that defines the total duration
 *
 * @public
 */
export function useChain(
  refs: ReadonlyArray<SpringRef>,
  timeSteps?: number[],
  timeFrame = 1000
) {
  useIsomorphicLayoutEffect(() => {
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
              // memoizing stops recursion https://github.com/pmndrs/react-spring/issues/1367
              const memoizedDelayProp = props.delay
              props.delay = key => delay + callProp(memoizedDelayProp || 0, key)
            })
          })

          ref.start()
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
            return Promise.all(ref.start())
          })
        }
      })
    }
  })
}
