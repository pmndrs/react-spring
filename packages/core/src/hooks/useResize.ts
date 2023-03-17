import { MutableRefObject } from 'react'
import { onResize, each, useIsomorphicLayoutEffect } from '@react-spring/shared'

import { SpringProps, SpringValues } from '../types'

import { useSpring } from './useSpring'

export interface UseResizeOptions extends Omit<SpringProps, 'to' | 'from'> {
  container?: MutableRefObject<HTMLElement | null | undefined>
}

/**
 * A small abstraction around the `useSpring` hook. It returns a `SpringValues` 
 * object with the `width` and `height` of the element it's attached to & doesn't 
 * necessarily have to be attached to the window, by passing a `container` you 
 * can observe that element's size instead.
 * 
 ```jsx
    import { useResize, animated } from '@react-spring/web'

    function MyComponent() {
      const { width } = useResize()

      return (
        <animated.div style={{ width }}>
          Hello World
        </animated.div>
      )
    }
  ```
 * 
 * @param {UseResizeOptions} UseResizeOptions options for the useScroll hook.
 * @param {MutableRefObject<HTMLElement>} UseResizeOptions.container the container to listen to scroll events on, defaults to the window.
 *
 * @returns {SpringValues<{width: number; height: number;}>} SpringValues the collection of values returned from the inner hook
 */
export const useResize = ({
  container,
  ...springOptions
}: UseResizeOptions): SpringValues<{
  width: number
  height: number
}> => {
  const [sizeValues, api] = useSpring(
    () => ({
      width: 0,
      height: 0,
      ...springOptions,
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
