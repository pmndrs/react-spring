import { useState } from 'react'
import { useIsMounted } from './useIsMounted'

/** Return a function that re-renders this component, if still mounted */
export function useForceUpdate() {
  const update = useState<any>()[1]
  const isMounted = useIsMounted()
  return () => {
    if (isMounted.current) {
      update(Math.random())
    }
  }
}
