import { ReactNode } from 'react'
import { animated } from '@react-spring/web'

import { useAnimatedHeader } from '~/hooks/useAnimatedHeader'

import { styled } from '~/styles/stitches.config'

import { getHeaderHeights } from '../Header/Header'

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
    <Aside style={styles} isStuck={isStuck}>
      {children}
    </Aside>
  )
}

const Aside = styled(animated.aside, {
  display: 'none',
  flexShrink: 1,
  width: '30rem',
  gridArea: 'aside',

  '@tabletUp': {
    display: 'block',
    pt: '$25',
  },

  variants: {
    isStuck: {
      true: {
        position: 'fixed',
      },
    },
  },
})
