import { useEffect, useRef } from 'react'
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect'

/**
 * Calls `cleanup` when the component unmounts (including StrictMode's
 * simulated unmount), but not when a Fast Refresh edit re-runs its effects.
 */
export const useUnmount = (cleanup: () => void) => {
  // A refresh re-runs this layout effect before the old passive cleanup below,
  // while an unmount runs that cleanup with no layout effect in between (#2678).
  const remounted = useRef(false)
  useIsomorphicLayoutEffect(() => {
    remounted.current = true
  }, [])
  useEffect(() => {
    remounted.current = false
    return () => {
      if (!remounted.current) cleanup()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
