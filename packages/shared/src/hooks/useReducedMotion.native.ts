import { useState } from 'react'
import { AccessibilityInfo } from 'react-native'

import { assign } from '../globals'

import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect.native'

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
    const handleMediaChange = (isReducedMotion: boolean) => {
      setReducedMotion(isReducedMotion)

      assign({
        skipAnimation: isReducedMotion,
      })
    }

    AccessibilityInfo.isReduceMotionEnabled().then(handleMediaChange)

    const motionSubscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      handleMediaChange
    )

    return () => {
      motionSubscription.remove()
    }
  }, [])

  return reducedMotion
}
