import { ReactNode } from 'react'
import { animated } from '@react-spring/web'

import { useAnimatedHeader } from '~/hooks/useAnimatedHeader'

import { getHeaderHeights } from '../Header/Header'
import { aside } from './StickyAside.css'

interface StickyAsideProps {
  children?: ReactNode
  hasSubNav?: boolean
}

export const StickyAside = ({ children }: StickyAsideProps) => {
  const [styles, isStuck] = useAnimatedHeader({
    isHeader: false,
    heights: getHeaderHeights(),
  })

  return (
    <animated.aside
      className={aside({
        isStuck,
      })}
      style={styles}
    >
      {children}
    </animated.aside>
  )
}
