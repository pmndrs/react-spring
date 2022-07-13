import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { List } from 'phosphor-react'
import { animated } from '@react-spring/web'
import { Property } from '@stitches/react/types/css'

import { dark, styled } from '~/styles/stitches.config'

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

export const getHeaderHeights = (): [desktop: number, mobile: number] => [
  89, 63,
]

export const Header = ({
  data,
  className,
  transparentBackground = false,
  addMarginToMain = true,
  position,
  alwaysAnimateHeader,
}: HeaderProps) => {
  const { sidebar, subnav = [] } = data ?? {}
  const [dialogOpen, setDialogOpen] = useState(false)

  const headerHeights = getHeaderHeights()

  const [styles, isStuck, scrollTop, direction] = useAnimatedHeader({
    isHeader: true,
    alwaysAnimate: alwaysAnimateHeader,
    heights: headerHeights,
  })

  const handleDialogChange = (isOpen: boolean) => setDialogOpen(isOpen)

  const handleNavigationClick = () => setDialogOpen(false)

  const [desktopHeight, mobileHeight] = headerHeights

  return (
    <Head
      className={className}
      isStuck={isStuck}
      style={{ ...styles, position: position }}
      hasScrolledDown={
        subnav.length > 0 || (scrollTop > 20 && direction === 'up')
      }
      transparentBackground={transparentBackground}
      addMarginToMain={addMarginToMain}
      css={
        isStuck
          ? {
              '& + aside + main': {
                pt: mobileHeight,
              },
              '@tabletUp': {
                '& + aside + main': {
                  pt: desktopHeight,
                },
              },
            }
          : {}
      }>
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
  pt: '$15',
  zIndex: '$1',

  '@motion': {
    transition: 'background-color 400ms ease-out',
  },

  '@tabletUp': {
    pt: '$25',
  },

  // Give a good offset for the jump links
  '& + aside + main > article > h2': {
    pointerEvents: 'none',

    '&::before': {
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
  },

  variants: {
    hasScrolledDown: {
      true: {
        backgroundColor: 'rgba(250, 250, 250, 0.80)',
        backdropFilter: 'blur(5px)',

        '@supports not (backdrop-filter: blur(10px))': {
          backgroundColor: 'rgba(250, 250, 250, 0.95)',
        },

        [`.${dark} &`]: {
          backgroundColor: 'rgba(27, 26, 34, 0.8)',

          '@supports not (backdrop-filter: blur(10px))': {
            backgroundColor: 'rgba(27, 26, 34, 0.95)',
          },
        },
      },
      false: {},
    },
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
