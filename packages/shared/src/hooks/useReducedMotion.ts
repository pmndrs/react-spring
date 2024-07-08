import { useState } from 'react'

import { assign } from '../globals'
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect'

/**
 * Returns `boolean` or `null`, used to automatically
 * set skipAnimations to the value of the user's
 * `prefers-reduced-motion` query.
 *
 * The return value, post-effect, is the value of their prefered setting
 */
export const useReducedMotion = () => {
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null)

  useIsomorphicLayoutEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion)')

    const handleMediaChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setReducedMotion(e.matches)

      assign({
        skipAnimation: e.matches,
      })
    }

    handleMediaChange(mql)

    if (mql.addEventListener) {
      mql.addEventListener('change', handleMediaChange)
    } else {
      mql.addListener(handleMediaChange)
    }

    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener('change', handleMediaChange)
      } else {
        mql.removeListener(handleMediaChange)
      }
    }
  }, [])

  return reducedMotion
}
