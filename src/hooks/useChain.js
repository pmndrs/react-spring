import { useEffect, useRef } from 'react'

export function useChain(refs, timeSteps, timeFrame = 1000) {
  const frames = useRef([])
  useEffect(() => {
    if (timeSteps) {
      frames.current.forEach(clearTimeout)
      frames.current = []
      refs.forEach((ref, index) =>
        frames.current.push(
          setTimeout(() => ref.current.start(), timeFrame * timeSteps[index])
        )
      )
    } else {
      // Adding stops
      const promise = refs.reduce(
        (q, { current }) =>
          (q = q.then(
            () => current && new Promise(resolve => current.stop(true, resolve))
          )),
        Promise.resolve()
      )
      // Now add start to the promise chain
      refs.reduce(
        (q, { current }) =>
          (q = q.then(() => current && new Promise(current.start))),
        promise
      )
    }
  }, refs)
}
