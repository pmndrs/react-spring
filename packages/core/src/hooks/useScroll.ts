import { each, onScroll, useIsomorphicLayoutEffect } from '@react-spring/shared'
import { MutableRefObject } from 'react'

import { useSpring } from './useSpring'

export interface UseScrollOptions {
  container: MutableRefObject<HTMLElement>
}

export const useScroll = ({ container }: UseScrollOptions) => {
  const [scrollValues, api] = useSpring(
    () => ({
      scrollX: 0,
      scrollY: 0,
      scrollXProgress: 0,
      scrollYProgress: 0,
    }),
    []
  )

  useIsomorphicLayoutEffect(() => {
    const cleanupScroll = onScroll(
      ({ x, y }) => {
        api.start({
          scrollX: x.current,
          scrollXProgress: x.progress,
          scrollY: y.current,
          scrollYProgress: y.progress,
        })
      },
      { container: container?.current || undefined }
    )

    return () => {
      /**
       * Stop the springs on unmount.
       */
      each(Object.values(scrollValues), value => value.stop())

      cleanupScroll()
    }
  }, [])

  return scrollValues
}
