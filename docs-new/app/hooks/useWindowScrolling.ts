import { raf } from '@react-spring/rafz'
import { useState } from 'react'
import { useIsomorphicLayoutEffect } from './useIsomorphicEffect'

type SCROLL_UP = 'up'
type SCROLL_DOWN = 'down'
type SCROLL_DIR = SCROLL_DOWN | SCROLL_UP

type ScrollState = {
  scrollTop: number
  direction: SCROLL_DIR | undefined
}

type UseWindowScrolling = (args: {
  threshold?: number | [down: number, up: number]
  active?: boolean
  yOffset?: number
  onScroll?: (e: Event) => void
}) => ScrollState

export const useWindowScrolling: UseWindowScrolling = ({
  active = true,
  threshold = 0,
  yOffset = 0,
  onScroll,
}) => {
  const [scrollState, setScrollState] = useState<ScrollState>({
    direction: undefined,
    scrollTop: 0,
  })

  useIsomorphicLayoutEffect(() => {
    let lastScrollY = window.pageYOffset
    let ticking = false

    const updateScrollDir = () => {
      const scrollY = window.pageYOffset
      const direction = scrollY > lastScrollY ? 'down' : 'up'

      const thresholdValue = Array.isArray(threshold)
        ? threshold[direction === 'down' ? 0 : 1]
        : threshold

      if (!active) {
        setScrollState(s => ({
          ...s,
          direction: undefined,
        }))
        return
      }

      if (scrollY < yOffset) {
        ticking = false
        return
      }

      if (Math.abs(scrollY - lastScrollY) < thresholdValue) {
        ticking = false
        return
      }

      setScrollState({
        direction,
        scrollTop: scrollY,
      })
      lastScrollY = scrollY > 0 ? scrollY : 0
      ticking = false
    }

    const handleScroll = (e: Event) => {
      if (!ticking) {
        raf(updateScrollDir)
        ticking = true
      } else if (onScroll) {
        onScroll(e)
      }
    }

    window.addEventListener('scroll', handleScroll)

    return () => window.removeEventListener('scroll', handleScroll)
  }, [active, threshold])

  return scrollState
}
