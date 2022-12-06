import { MutableRefObject } from 'react'
import { each, onScroll, useIsomorphicLayoutEffect } from '@react-spring/shared'

import { SpringProps, SpringValues } from '../types'

import { useSpring } from './useSpring'

export interface UseScrollOptions extends Omit<SpringProps, 'to' | 'from'> {
  container?: MutableRefObject<HTMLElement>
}

/**
 * A small utility abstraction around our signature useSpring hook. It's a great way to create
 * a scroll-linked animation. With either the raw value of distance or a 0-1 progress value.
 * You can either use the scroll values of the whole document, or just a specific element.
 *
 * 
 ```jsx
    import { useScroll, animated } from '@react-spring/web'

    function MyComponent() {
      const { scrollYProgress } = useScroll()

      return (
        <animated.div style={{ opacity: scrollYProgress }}>
          Hello World
        </animated.div>
      )
    }
  ```
 * 
 * @param {UseScrollOptions} useScrollOptions options for the useScroll hook.
 * @param {MutableRefObject<HTMLElement>} useScrollOptions.container the container to listen to scroll events on, defaults to the window.
 *
 * @returns {SpringValues<{scrollX: number; scrollY: number; scrollXProgress: number; scrollYProgress: number}>} SpringValues the collection of values returned from the inner hook
 */
export const useScroll = ({
  container,
  ...springOptions
}: UseScrollOptions = {}): SpringValues<{
  scrollX: number
  scrollY: number
  scrollXProgress: number
  scrollYProgress: number
}> => {
  const [scrollValues, api] = useSpring(
    () => ({
      scrollX: 0,
      scrollY: 0,
      scrollXProgress: 0,
      scrollYProgress: 0,
      ...springOptions,
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
