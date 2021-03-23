import { useEffect, useRef } from 'react'

/** Use a value from the previous render */
export function usePrev<T>(value: T): T | undefined {
  const prevRef = useRef<any>()
  useEffect(() => {
    prevRef.current = value
  })
  return prevRef.current
}
