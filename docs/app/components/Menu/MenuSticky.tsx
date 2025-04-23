import { animated } from '@react-spring/web'

import { useAnimatedHeader } from '~/hooks/useAnimatedHeader'

import { HeaderSubnav } from '../Header/HeaderSubnav'

import { SubtitleSchemaItem } from '../../../scripts/docs/navigation'
import { getHeaderHeights } from '../Header/Header'
import clsx from 'clsx'
import { stickyMenu, stickyMenuStuck } from './MenuSticky.css'

interface MenuStickyProps {
  tag?: keyof React.JSX.IntrinsicElements
  className?: string
  subnav: SubtitleSchemaItem
}

export const MenuSticky = ({ className, subnav }: MenuStickyProps) => {
  const [styles, isStuck] = useAnimatedHeader({
    isHeader: false,
    heights: getHeaderHeights(),
  })

  return (
    <animated.header
      className={clsx(stickyMenu, isStuck && stickyMenuStuck, className)}
      style={styles}
    >
      <HeaderSubnav subnav={subnav} />
    </animated.header>
  )
}
