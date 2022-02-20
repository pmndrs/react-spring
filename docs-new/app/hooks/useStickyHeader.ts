import { useState } from 'react'

import { HEADER_HEIGHT } from '~/components/Header/Header'

import { useIsomorphicLayoutEffect } from './useIsomorphicEffect'
import { useWindowScrolling } from './useWindowScrolling'

export const useStickyHeader = () => {
  const [stickyHeader, setStickyHeader] = useState(false)

  const [_, scrollTop] = useWindowScrolling({
    active: true,
  })

  useIsomorphicLayoutEffect(() => {
    const { innerWidth } = window

    const limit = innerWidth < 768 ? HEADER_HEIGHT[1] : HEADER_HEIGHT[0]

    if (scrollTop >= limit) {
      setStickyHeader(true)
    } else {
      setStickyHeader(false)
    }
  }, [scrollTop])

  return stickyHeader
}
