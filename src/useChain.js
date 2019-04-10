import { useEffect, useMemo, useRef } from 'react'
import { is } from './shared/helpers'

/** API
 *  useChain(references, timeSteps, timeFrame)
 */

export function useChain(refs, timeSteps, timeFrame = 1000) {
  const previous = useRef()
  useEffect(() => {
    if (is.equ(refs, previous.current))
      refs.forEach(({ current }) => current && current.start())
    else if (timeSteps) {
      refs.forEach(({ current }, index) => {
        if (current) {
          const ctrls = current.controllers
          if (ctrls.length) {
            const t = timeFrame * timeSteps[index]
            ctrls.forEach(ctrl => {
              ctrl.queue.forEach(props => (props.delay += t))
              ctrl.start()
            })
          }
        }
      })
    } else
      refs.reduce(
        (q, { current }, rI) => (q = q.then(() => current.start())),
        Promise.resolve()
      )
    previous.current = refs
  })
}
