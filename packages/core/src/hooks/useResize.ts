import { MutableRefObject } from 'react'
import { onResize, each, useIsomorphicLayoutEffect } from '@react-spring/shared'

import { SpringValues } from '../types'

import { useSpring } from './useSpring'

export interface UseResizeOptions {
  container: MutableRefObject<HTMLElement>
}

export const useResize = ({
  container,
}: UseResizeOptions): SpringValues<{
  width: number
  height: number
}> => {
  const [sizeValues, api] = useSpring(
    () => ({
      width: 0,
      height: 0,
    }),
    []
  )

  useIsomorphicLayoutEffect(() => {
    const cleanupScroll = onResize(
      ({ width, height }) => {
        api.start({
          width,
          height,
          immediate:
            sizeValues.width.get() === 0 || sizeValues.height.get() === 0,
        })
      },
      { container: container?.current || undefined }
    )

    return () => {
      /**
       * Stop the springs on unmount.
       */
      each(Object.values(sizeValues), value => value.stop())

      cleanupScroll()
    }
  }, [])

  return sizeValues
}
