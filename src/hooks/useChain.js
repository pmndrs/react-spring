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

export function useChain2 (args, dependants) {
  const chain = async function (args) {
    for (let ref of args) {
      if (ref && ref.current && ref.current.stop) {
        await new Promise(
          resolve => ref.current.stop && ref.current.stop(true, resolve)
        )
      }
    }
    for (let ref of args) {
      if (ref && ref.current) {
        ref.current.isActive && ref.current.stop && ref.current.stop()
        // console.log('starting ', '---------------',  localId, guidRef.current, ref.current.tag)
        await new Promise(resolve => ref.current.start(resolve))
      }
    }
  }
  useEffect(() => void chain(args), dependants)
}
