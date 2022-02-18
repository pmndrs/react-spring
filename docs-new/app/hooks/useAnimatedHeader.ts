import { SpringValue, useSpring } from '@react-spring/web'
import { HEADER_HEIGHT } from '~/components/Header/Header'
import { useIsomorphicLayoutEffect } from './useIsomorphicEffect'
import { useStickyHeader } from './useStickyHeader'
import { useWindowScrolling } from './useWindowScrolling'

export const useAnimatedHeader = (
  isHeader = true
): [styles: { top: SpringValue<number> }, isStuck: boolean] => {
  const scrollState = useWindowScrolling({
    active: true,
    threshold: [0, 20],
  })

  const isStuck = useStickyHeader()

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
    const { direction } = scrollState

    const limit = innerWidth < 768 ? HEADER_HEIGHT[1] : HEADER_HEIGHT[0]

    if (direction === 'down') {
      api.start({
        top: isHeader ? limit * -1 : 0,
        immediate: !isStuck,
      })
    } else if (direction === 'up') {
      api.start({
        top: isHeader ? 0 : limit,
      })
    }
  }, [scrollState, isStuck])

  return [styles, isStuck]
}
