import { useEffect } from 'react'

export function useChain(args) {
  useEffect(() => {
    args.reduce(
      (q, { current }) =>
        (q = q.then(() => current && new Promise(current.start))),
      Promise.resolve()
    )
  }, args)
}
