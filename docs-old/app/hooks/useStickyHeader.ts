import { useState } from 'react'

import { useIsomorphicLayoutEffect } from './useIsomorphicEffect'
import { useWindowScrolling } from './useWindowScrolling'

export const useStickyHeader = (heights: [desktop: number, mobile: number]) => {
  const [stickyHeader, setStickyHeader] = useState(false)

  const [direction, scrollTop] = useWindowScrolling({
    active: true,
  })

  useIsomorphicLayoutEffect(() => {
    const { innerWidth } = window

    const limit = innerWidth < 768 ? heights[1] : heights[0]

    if (scrollTop >= limit && direction === 'down') {
      setStickyHeader(true)
    } else if (direction === 'up' && scrollTop === 0) {
      setStickyHeader(false)
    }
  }, [scrollTop, direction])

  return stickyHeader
}
