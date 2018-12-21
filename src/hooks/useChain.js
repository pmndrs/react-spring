import { useEffect, useRef } from 'react'

export function useChain(refs, timeSteps, timeFrame = 1000) {
  const frames = useRef([])
  useEffect(() => {
    refs.forEach(({ current }) => current && current.stop())
    if (timeSteps) {
      frames.current.forEach(clearTimeout)
      frames.current = []
      refs.forEach((ref, index) =>
        frames.current.push(
          setTimeout(() => ref.current.start(), timeFrame * timeSteps[index])
        )
      )
    } else {
      refs.reduce(
        (q, { current }) => (q = q.then(() => current && current.start())),
        Promise.resolve()
      )
    }
  }, refs)
}
