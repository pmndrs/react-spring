import { raf } from '@react-spring/rafz'
import { useState } from 'react'
import { useIsomorphicLayoutEffect } from './useIsomorphicEffect'

type SCROLL_UP = 'up'
type SCROLL_DOWN = 'down'
type SCROLL_DIR = SCROLL_DOWN | SCROLL_UP

type UseWindowScrolling = (args: {
  threshold?: number | [down: number, up: number]
  active?: boolean
  yOffset?: number
  onScroll?: (e: Event) => void
}) => [direction: SCROLL_DIR | undefined, scrollTop: number]

export const useWindowScrolling: UseWindowScrolling = ({
  active = true,
  threshold = 0,
  yOffset = 0,
  onScroll,
}) => {
  const [direction, setDirection] = useState<SCROLL_DIR | undefined>(undefined)
  const [scrollTop, setScrollTop] = useState(0)

  useIsomorphicLayoutEffect(() => {
    let lastScrollY = 0
    let ticking = false

    const updateScrollDir = () => {
      const scrollY = window.pageYOffset
      const direction = scrollY > lastScrollY ? 'down' : 'up'

      const thresholdValue = Array.isArray(threshold)
        ? threshold[direction === 'down' ? 0 : 1]
        : threshold

      if (!active) {
        setDirection(undefined)
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

      setDirection(direction)
      setScrollTop(scrollY)

      lastScrollY = scrollY > 0 ? scrollY : 0
      ticking = false
    }

    const handleScroll = (e?: Event) => {
      if (!ticking) {
        raf(updateScrollDir)
        ticking = true
      } else if (onScroll && e) {
        onScroll(e)
      }
    }

    updateScrollDir()

    window.addEventListener('scroll', handleScroll)

    return () => window.removeEventListener('scroll', handleScroll)
  }, [active, threshold])

  return [direction, scrollTop]
}
