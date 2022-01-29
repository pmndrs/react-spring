// Based off: https://gist.github.com/reecelucas/cd110ece696cca8468db895281fa28cb
import { useEffect, useState } from 'react'

type SCROLL_UP = 'up'
type SCROLL_DOWN = 'down'
type SCROLL_DIR = SCROLL_DOWN | SCROLL_UP

type ScrollDirection = {
  direction: SCROLL_DIR
  value: number
}

export const useScrollDirection = ({
  active = true,
  threshold = 0,
  yOffset = 0,
}: {
  active?: boolean
  threshold: number
  yOffset?: number
}): ScrollDirection | undefined => {
  const [scrollDir, setScrollDir] = useState<ScrollDirection>()

  useEffect(() => {
    let lastScrollY = window.pageYOffset
    let ticking = false

    const updateScrollDir = () => {
      const scrollY = window.pageYOffset

      if (!active) {
        setScrollDir(undefined)
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

      setScrollDir({
        direction: scrollY > lastScrollY ? 'down' : 'up',
        value: scrollY,
      })
      lastScrollY = scrollY > 0 ? scrollY : 0
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDir)
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll)

    return () => window.removeEventListener('scroll', onScroll)
  }, [active, threshold, yOffset])

  return scrollDir
}
