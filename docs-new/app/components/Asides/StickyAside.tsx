import { FC } from 'react'
import { animated } from '@react-spring/web'

import { useAnimatedHeader } from '~/hooks/useAnimatedHeader'

import { styled } from '~/styles/stitches.config'

export const StickyAside: FC = ({ children }) => {
  const [styles, isStuck] = useAnimatedHeader(false)

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
