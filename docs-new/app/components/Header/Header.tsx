import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { List } from 'phosphor-react'
import { animated, useSpring } from '@react-spring/web'

import { styled } from '~/styles/stitches.config'

import { useWindowScrolling } from '~/hooks/useWindowScrolling'
import { useIsomorphicLayoutEffect } from '~/hooks/useIsomorphicEffect'

import { Logo } from '../Logo'
import { MenuSticky } from '../Menu/MenuSticky'

import type {
  NavigationSchema,
  SubtitleSchemaItem,
} from '../../../scripts/docs/navigation'

import { HeaderNavigation } from './HeaderNavigation'
import { HeaderSidePanel } from './HeaderSidePanel'

interface HeaderProps {
  data?: {
    sidebar: NavigationSchema
    subnav: SubtitleSchemaItem
  }
  className?: string
}

export const HEADER_HEIGHT: [desktop: number, mobile: number] = [
  64 + 25,
  48 + 15,
]

export const Header = ({ data, className }: HeaderProps) => {
  const { sidebar, subnav } = data ?? {}
  const [dialogOpen, setDialogOpen] = useState(false)
  const [stickyHeader, setStickyHeader] = useState(false)

  const [styles, api] = useSpring(() => ({
    top: 0,
  }))

  const scrollState = useWindowScrolling({
    active: true,
    threshold: [0, 40],
  })

  const handleDialogChange = (isOpen: boolean) => setDialogOpen(isOpen)

  const handleNavigationClick = () => setDialogOpen(false)

  /**
   * Handles forcing the main nav to
   * drop back down when scrolling up.
   * Handles _not_ showing the main nav
   * if a subnav link is clicked to scroll
   * back up.
   */
  // useIsomorphicLayoutEffect(() => {
  //   const { innerWidth } = window
  //   const { direction, scrollTop } = scrollState

  //   const limit = innerWidth < 768 ? HEADER_HEIGHT[1] : HEADER_HEIGHT[0]

  //   if (scrollTop >= limit) {
  //     setStickyHeader(true)
  //   } else if (scrollTop === 0) {
  //     setStickyHeader(false)
  //   }

  //   if (direction === 'down') {
  //     api.start({
  //       top: limit * -1,
  //       immediate: !(scrollTop >= limit),
  //     })
  //   } else if (direction === 'up') {
  //     api.start({
  //       top: 0,
  //     })
  //   }
  // }, [scrollState])

  return (
    <Head
      className={className}
      hasSubNav={Boolean(subnav)}
      isStuck={stickyHeader}
      style={styles}>
      <FlexContainer>
        <DesktopNavigation />
        <Dialog.Root open={dialogOpen} onOpenChange={handleDialogChange}>
          <MobileMenuButton>
            <HamburgerMenu size={20} />
          </MobileMenuButton>
          <Dialog.Portal forceMount>
            <HeaderSidePanel
              onNavigationClick={handleNavigationClick}
              isOpen={dialogOpen}
              submenu={sidebar}
            />
          </Dialog.Portal>
        </Dialog.Root>
        <Logo />
      </FlexContainer>
      {subnav ? <HeaderSticky tag="div" subnav={subnav} /> : null}
    </Head>
  )
}

const Head = styled(animated.header, {
  width: '100%',
  py: '$15',
  backgroundColor: 'rgba(250, 250, 250, 0.80)',
  backdropFilter: 'blur(5px)',
  zIndex: '$1',

  '@supports not (backdrop-filter: blur(10px))': {
    backgroundColor: 'rgba(250, 250, 250, 0.95)',
  },

  '& + main': {
    pt: '$10',
  },

  '@tabletUp': {
    py: '$25',

    '& + main': {
      pt: '$20',
    },
  },

  // Give a good offset for the jump links
  '& + main h2::before': {
    display: 'block',
    content: ' ',
    marginTop: '-48px',
    height: '48px',
    visibility: 'hidden',
    pointerEvents: 'none',

    '@tabletUp': {
      marginTop: '-64px',
      height: '64px',
    },
  },

  variants: {
    isStuck: {
      true: {
        position: 'fixed',
        '& + main': {
          pt: `12.5rem`,
        },
        '@tabletUp': {
          '& + main': {
            pt: `17.1rem`,
          },
        },
      },
    },
    hasSubNav: {
      true: {
        pb: '0',
        '@tabletUp': {
          pb: '0',
        },
      },
    },
  },
})

const FlexContainer = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  px: '$25',

  '@tabletUp': {
    px: '$50',
  },
})

const DesktopNavigation = styled(HeaderNavigation, {
  display: 'none',

  '@tabletUp': {
    display: 'flex',
  },
})

const MobileMenuButton = styled(Dialog.Trigger, {
  margin: 0,
  padding: '0.8rem 0.8rem',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
  border: 'none',
  background: 'none',
  marginLeft: '-0.8rem',

  '@tabletUp': {
    display: 'none',
  },
})

const HamburgerMenu = styled(List, {
  color: '$black',
})

const HeaderSticky = styled(MenuSticky, {
  '@tabletUp': {
    display: 'none',
  },
})
