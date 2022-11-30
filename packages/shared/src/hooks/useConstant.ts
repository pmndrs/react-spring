import { useRef } from 'react'

type Init<T> = () => T

/**
 * Creates a constant value over the lifecycle of a component.
 */
export function useConstant<T>(init: Init<T>) {
  const ref = useRef<T | null>(null)

  if (ref.current === null) {
    ref.current = init()
  }

  return ref.current
}
