import { useState } from 'react'

import { styled } from '~/styles/stitches.config'

import { useWindowScrolling } from '~/hooks/useWindowScrolling'

import { HeaderSubnav } from '../Header/HeaderSubnav'
import { HEADER_HEIGHT } from '../Header/Header'

import { SubtitleSchemaItem } from '../../../scripts/docs/navigation'
import { useIsomorphicLayoutEffect } from '~/hooks/useIsomorphicEffect'

interface MenuStickyProps {
  tag?: keyof JSX.IntrinsicElements
  className?: string
  subnav: SubtitleSchemaItem
}

export const MenuSticky = ({
  className,
  tag = 'header',
  subnav,
}: MenuStickyProps) => {
  const [stickyHeader, setStickyHeader] = useState(false)

  const scrollState = useWindowScrolling({
    active: true,
  })

  useIsomorphicLayoutEffect(() => {
    const { innerWidth } = window
    const { scrollTop } = scrollState

    const limit = innerWidth < 768 ? HEADER_HEIGHT[1] : HEADER_HEIGHT[0]

    if (scrollTop >= limit) {
      setStickyHeader(true)
    } else if (scrollTop === 0) {
      setStickyHeader(false)
    }
  }, [scrollState])

  console.log(scrollState.scrollTop)

  return (
    <StickyMenu className={className} as={tag} isStuck={stickyHeader}>
      <HeaderSubnav subnav={subnav} />
    </StickyMenu>
  )
}

const StickyMenu = styled('header', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  backgroundColor: 'rgba(250, 250, 250, 0.80)',
  backdropFilter: 'blur(5px)',
  zIndex: '$1',
  px: 0,
  top: 0,

  '@tabletUp': {
    px: 0,
  },

  variants: {
    isStuck: {
      true: {
        position: 'fixed',
      },
    },
  },
})
