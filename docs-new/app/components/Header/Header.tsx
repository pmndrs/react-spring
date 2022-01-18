import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, List } from 'phosphor-react'
import { animated, useTransition } from '@react-spring/web'

import { styled } from '~/styles/stitches.config'

import { Logo } from '../Logo'
import { HeaderNavigation } from './HeaderNavigation'

import type {
  NavigationSchemaItem,
  SubtitleSchemaItem,
} from '../../../scripts/docs/navigation'
import { HeaderSubnav } from './HeaderSubnav'

interface HeaderProps {
  data?: {
    sidebar: NavigationSchemaItem
    subnav: SubtitleSchemaItem
  }
}

export const Header = ({ data }: HeaderProps) => {
  const { sidebar, subnav } = data ?? {}
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleDialogChange = (isOpen: boolean) => setDialogOpen(isOpen)

  const transitions = useTransition(dialogOpen, {
    from: {
      x: '-100%',
      opacity: 0,
    },
    enter: {
      x: '0',
      opacity: 1,
    },
    leave: {
      x: '-100%',
      opacity: 0,
    },
    config: {
      tension: 210,
      friction: 25,
      mass: 1,
    },
  })

  return (
    <Head>
      <MaxWidth>
        <DesktopNavigation />
        <Dialog.Root open={dialogOpen} onOpenChange={handleDialogChange}>
          <MobileMenuButton>
            <HamburgerMenu size={20} />
          </MobileMenuButton>
          <Dialog.Portal forceMount>
            {transitions(({ opacity, x }, item) =>
              item ? (
                <>
                  <Dialog.Overlay forceMount asChild>
                    <MobileMenuOverlay style={{ opacity }} />
                  </Dialog.Overlay>
                  <Dialog.Content forceMount asChild>
                    <MobileMenu style={{ x }}>
                      <MobileMenuClose>
                        <X />
                      </MobileMenuClose>
                      <HiddenTitle>Main Menu</HiddenTitle>
                      <HeaderNavigation showSubNav={false} />
                    </MobileMenu>
                  </Dialog.Content>
                </>
              ) : null
            )}
          </Dialog.Portal>
        </Dialog.Root>
        <Logo />
      </MaxWidth>
      <MaxWidth>{subnav ? <HeaderSubnav subnav={subnav} /> : null}</MaxWidth>
    </Head>
  )
}

const Head = styled('header', {
  width: '100%',
  background: '$white',
  padding: '$15 $25',

  '@tabletUp': {
    padding: '$25 $50',
  },
})

const MaxWidth = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  maxWidth: '$document',
  margin: '0 auto',
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

const MobileMenuOverlay = styled(animated.div, {
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  width: '100vw',
  height: '100vh',
  zIndex: 0,
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
  backdropFilter: 'blur(5px)',

  '@supports not (backdrop-filter: blur(10px))': {
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
})

const MobileMenu = styled(animated.div, {
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  height: '100vh',
  width: '30rem',
  background: '$white',
  zIndex: 1,
  boxShadow: '3px 0 12px -10px rgba(0,0,0,0.5)',
  padding: '$25 $20',
})

const MobileMenuClose = styled(Dialog.Close, {
  border: 'none',
  color: '$steel',
  background: 'transparent',
  mb: '$20',
  p: '1.1rem 1.2rem',
})

const HiddenTitle = styled(Dialog.Title, {
  visuallyHidden: '',
})
