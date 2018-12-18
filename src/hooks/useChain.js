import { useEffect } from 'react'

export function useChain (args, dependants) {
  useEffect(() => {
    // adding stops
    const promise = args.reduce((q, { current }) => {
      q = q.then(() => current && new Promise(resolve => current.stop(true, resolve)))
      return q
    }, Promise.resolve())

    // now add start to the promis chain
   args.reduce((q, { current }) => {
      q = q.then(() => current && new Promise(current.start))
      return q
    }, promise)
  }, dependants || args)
}
