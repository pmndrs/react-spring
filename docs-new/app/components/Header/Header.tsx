import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { List } from 'phosphor-react'
import { animated } from '@react-spring/web'
import { Property } from '@stitches/react/types/css'

import { styled } from '~/styles/stitches.config'

import { useAnimatedHeader } from '~/hooks/useAnimatedHeader'

import { Logo } from '../Logo'

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
  transparentBackground?: boolean
  addMarginToMain?: boolean
  alwaysAnimateHeader?: boolean
  position?: Property.Position
}

export const HEADER_HEIGHT: [desktop: number, mobile: number] = [
  64 + 25,
  48 + 15,
]

export const Header = ({
  data,
  className,
  transparentBackground = false,
  addMarginToMain = true,
  position,
  alwaysAnimateHeader,
}: HeaderProps) => {
  const { sidebar, subnav } = data ?? {}
  const [dialogOpen, setDialogOpen] = useState(false)

  const [styles, isStuck] = useAnimatedHeader(true, alwaysAnimateHeader)

  const handleDialogChange = (isOpen: boolean) => setDialogOpen(isOpen)

  const handleNavigationClick = () => setDialogOpen(false)

  return (
    <Head
      className={className}
      hasSubNav={Boolean(subnav)}
      isStuck={isStuck}
      style={{ ...styles, position: position }}
      transparentBackground={transparentBackground}
      addMarginToMain={addMarginToMain}>
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

  '@tabletUp': {
    py: '$25',
  },

  // Give a good offset for the jump links
  '& + aside + main h2::before': {
    display: 'block',
    content: ' ',
    marginTop: '-48px',
    height: '48px',
    visibility: 'hidden',
    pointerEvents: 'none',

    '@tabletUp': {
      marginTop: '-82px',
      height: '82px',
    },
  },

  variants: {
    transparentBackground: {
      true: {
        backgroundColor: 'transparent',
        backdropFilter: 'unset',
      },
    },
    addMarginToMain: {
      true: {
        '& + main': {
          pt: '$10',
        },

        '@tabletUp': {
          '& + main': {
            pt: '$20',
          },
        },
      },
    },
    isStuck: {
      true: {
        position: 'fixed',
        '& + aside + main': {
          pt: `6.3rem`,
        },
        '@tabletUp': {
          '& + aside + main': {
            pt: 0,
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

    /**
     * For some reason when I try to just use
     * another `styled` component, it completely breaks...
     * probably should report that...
     */
    '& + header': {
      display: 'none',
    },
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
