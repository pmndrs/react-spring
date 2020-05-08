import { useEffect, useRef, useState } from 'react'

// Explicit type annotation fixes TS2742 error.
type UseOnce = (effect: React.EffectCallback) => void

export const useOnce: UseOnce = effect => useEffect(effect, [])

/** Return a function that re-renders this component, if still mounted */
export const useForceUpdate = () => {
  const update = useState<any>(0)[1]
  const unmounted = useRef(false)
  useOnce(() => () => {
    unmounted.current = true
  })
  return () => {
    if (!unmounted.current) {
      update({})
    }
  }
}

/** Use a value from the previous render */
export function usePrev<T>(value: T): T | undefined {
  const prevRef = useRef<any>(undefined)
  useEffect(() => {
    prevRef.current = value
  })
  return prevRef.current
}
