import React, { useEffect } from 'react'

// TODO, something needs to prevent left-over async calls when useChain has been called while
// we're in the middle of a chain. Guid === Local should do this, but something is not yet right

// let guid = 0
export function useChain(args) {
  // const local = ++guid
  useEffect(() => {
    args.reduce(
      (q, r) =>
        (q = q.then(
          () => r.current && /*guid === local &&*/ new Promise(r.current.start)
        )),
      Promise.resolve()
    )
  }, args)
}
