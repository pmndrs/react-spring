import { useCallback } from 'react'
import { useRouter } from 'next/router'

import { useIsomorphicLayoutEffect } from 'helpers/isomorphicLayoutEffect'

let scrollPositions = {}

export const useManageScroll = () => {
  const { pathname } = useRouter()

  const handleScroll = useCallback(() => {
    scrollPositions[pathname] = window.scrollY
    try {
      sessionStorage.setItem('scrollPositions', JSON.stringify(scrollPositions))
    } catch (e) {}
  }, [pathname])

  // this shouldn't fire if a hash is present
  useIsomorphicLayoutEffect(() => {
    try {
      let storage = JSON.parse(sessionStorage.getItem('scrollPositions'))
      if (storage) {
        scrollPositions = JSON.parse(storage) || {}
        if (scrollPositions[pathname]) {
          window.scrollTo(0, scrollPositions[pathname])
        }
      }
    } catch (e) {}

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useIsomorphicLayoutEffect(() => {
    if (!scrollPositions[pathname]) {
      // never seen this location before
      setTimeout(() => {
        // scroll just past the splash
        document.getElementById('router').scrollIntoView()
      }, 1)
    } else {
      // seen it
      window.scrollTo(0, scrollPositions[pathname])
    }
  }, [pathname])
}
