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
  direction: SCROLL_DIR | undefined
] => {
  const [direction, scrollTop] = useWindowScrolling({
    active: true,
    threshold: [0, 20],
  })

  const isStuck = useStickyHeader(heights)

  const [styles, api] = useSpring(() => ({
    top: 0,
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
      api.start({
        top: isHeader ? limit * -1 : 0,
        immediate: alwaysAnimate ? false : !isStuck,
      })
    } else if (direction === 'up') {
      api.start({
        top: isHeader ? 0 : limit,
      })
    }
  }, [direction, isStuck])

  return [styles, isStuck, scrollTop, direction]
}
