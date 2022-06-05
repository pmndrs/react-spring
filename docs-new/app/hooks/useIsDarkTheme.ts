import { useState } from 'react'
import { useIsomorphicLayoutEffect } from './useIsomorphicEffect'

export const useIsDarkTheme = () => {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useIsomorphicLayoutEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)')

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches)
    }

    setIsDarkMode(mql.matches)

    mql.addEventListener('change', handleMediaChange)

    return () => {
      mql.removeEventListener('change', handleMediaChange)
    }
  }, [])

  return isDarkMode
}
