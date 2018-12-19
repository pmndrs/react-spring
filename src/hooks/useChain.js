import { useEffect } from 'react'

export function useChain(args, dependants) {
  useEffect(
    () => {
      // Adding stops
      const promise = args.reduce(
        (q, { current }) =>
          (q = q.then(
            () => current && new Promise(resolve => current.stop(true, resolve))
          )),
        Promise.resolve()
      )
      // Now add start to the promise chain
      args.reduce(
        (q, { current }) =>
          (q = q.then(() => current && new Promise(current.start))),
        promise
      )
    },
    dependants !== void 0 ? dependants : args
  )
}
