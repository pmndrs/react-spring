import { SpringValue, useSpring } from '@react-spring/web'
import { useIsomorphicLayoutEffect } from './useIsomorphicEffect'
import { useStickyHeader } from './useStickyHeader'
import { useWindowScrolling, SCROLL_DIR } from './useWindowScrolling'

interface UseAnimatedHeaderProps {
  isHeader?: boolean
  alwaysAnimate?: boolean
  heights: [desktop: number, mobile: number]
}

export const useAnimatedHeader = ({
  isHeader = true,
  alwaysAnimate = false,
  heights,
}: UseAnimatedHeaderProps): [
  styles: { top: SpringValue<number> },
  isStuck: boolean,
  scrollTop: number,
  direction: SCROLL_DIR | undefined,
] => {
  const [direction, scrollTop] = useWindowScrolling({
    active: true,
    threshold: [0, 20],
  })

  const isStuck = useStickyHeader(heights)

  const [styles, api] = useSpring(() => ({
    top: 0,
    y: 0,
  }))

  /**
   * Handles forcing the main nav to
   * drop back down when scrolling up.
   * Handles _not_ showing the main nav
   * if a subnav link is clicked to scroll
   * back up.
   */
  useIsomorphicLayoutEffect(() => {
    const { innerWidth } = window

    const limit = innerWidth < 768 ? heights[1] : heights[0]

    if (direction === 'down') {
      if (!isStuck) {
        api.set({
          top: isHeader ? limit * -1 : 0,
        })
      }

      if (alwaysAnimate && !isStuck) {
        api.start({
          from: {
            y: limit,
          },
          to: {
            y: 0,
          },
        })
      }

      if (isStuck) {
        api.start({
          y: 0,
        })
      }
    } else if (direction === 'up') {
      if (scrollTop <= limit && !isStuck) {
        api.set({
          top: 0,
          y: 0,
        })
      } else {
        api.start({
          y: limit,
        })
      }
    }
  }, [direction, isStuck])

  return [styles, isStuck, scrollTop, direction]
}
