import * as React from 'react'
import { useIsomorphicLayoutEffect } from '@react-spring/web'

export const useWindowSize = () => {
  const [size, setSize] = React.useState([0, 0])
  useIsomorphicLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight])
    }
    window.addEventListener('resize', updateSize)
    updateSize()
    return () => window.removeEventListener('resize', updateSize)
  }, [])
  return size
}
