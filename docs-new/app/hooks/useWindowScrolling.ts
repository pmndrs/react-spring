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
  threshold?: number
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

      if (Math.abs(scrollY - lastScrollY) < threshold) {
        ticking = false
        return
      }

      setScrollState({
        direction: scrollY > lastScrollY ? 'down' : 'up',
        scrollTop: scrollY,
      })
      lastScrollY = scrollY > 0 ? scrollY : 0
      ticking = false
    }

    const onScroll = (e: Event) => {
      if (!ticking) {
        raf(updateScrollDir)
        ticking = true
      } else if (onScroll) {
        onScroll(e)
      }
    }

    window.addEventListener('scroll', onScroll)

    return () => window.removeEventListener('scroll', onScroll)
  }, [active, threshold])

  return scrollState
}
