import { useEffect, useRef, useState } from 'react'

type Cache<T> = {
  inputs?: any[]
  result?: T
}

// TODO: remove once merged (https://github.com/alexreardon/use-memo-one/pull/10)
export function useMemoOne<T>(getResult: () => T, inputs?: any[]): T {
  const [initial] = useState(
    (): Cache<T> => ({
      inputs,
      result: getResult(),
    })
  )

  const committed = useRef<Cache<T>>()
  const prevCache = committed.current

  let cache = prevCache
  if (cache) {
    const useCache = Boolean(
      inputs && cache.inputs && areInputsEqual(inputs, cache.inputs)
    )
    if (!useCache) {
      cache = {
        inputs,
        result: getResult(),
      }
    }
  } else {
    cache = initial
  }

  useEffect(() => {
    committed.current = cache
    if (prevCache == initial) {
      initial.inputs = initial.result = undefined
    }
  }, [cache])

  return cache.result!
}

function areInputsEqual(next: any[], prev: any[]) {
  if (next.length !== prev.length) {
    return false
  }
  for (let i = 0; i < next.length; i++) {
    if (next[i] !== prev[i]) {
      return false
    }
  }
  return true
}
