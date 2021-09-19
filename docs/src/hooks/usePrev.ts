import { useRef, useEffect } from 'react'

export const usePrev = <TVal extends any>(value: TVal) => {
  const prevRef = useRef<TVal>()
  useEffect(() => {
    prevRef.current = value
  })
  return prevRef.current
}
