import React, { useEffect } from 'react'

export function useChain(args) {
  useEffect(() => {
    let queue = Promise.resolve()
    for (let ref of args) {
      if (ref && ref.current)
        queue = queue.then(r => new Promise(ref.current.start))
    }
  }, args)
}
