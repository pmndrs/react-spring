import { useLocation } from '@remix-run/react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'phosphor-react'
import { animated, useTransition } from '@react-spring/web'
import * as Toolbar from '@radix-ui/react-toolbar'

import { styled } from '~/styles/stitches.config'

import { HeaderNavigation } from './HeaderNavigation'
import { HeaderSubNavigation } from './HeaderSubNavigation'
import { MenuDocs } from '../Menu/MenuDocs'

import { NavigationSchema } from '../../../scripts/docs/navigation'

interface HeaderSidePanelProps {
  isOpen: boolean
  submenu?: NavigationSchema
  onNavigationClick?: () => void
}

export const HeaderSidePanel = ({
  isOpen,
  submenu,
  onNavigationClick,
}: HeaderSidePanelProps) => {
  const location = useLocation()

  const isDocs = location.pathname.includes('/docs')

  const transitions = useTransition(isOpen, {
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

  const handleNavClick = () => {
    if (onNavigationClick) {
      onNavigationClick()
    }
  }

  return transitions(({ opacity, x }, item) =>
    item ? (
      <>
        <Dialog.Overlay forceMount asChild>
          <MobileMenuOverlay style={{ opacity }} />
        </Dialog.Overlay>
        <Dialog.Content forceMount asChild>
          <MobileMenu style={{ x }}>
            <div>
              <MobileMenuClose>
                <X />
              </MobileMenuClose>
              <HiddenTitle>Main Menu</HiddenTitle>
              <MainNavigation
                isDocsSection={isDocs}
                showSubNav={false}
                showLabels={!isDocs}
              />
            </div>
            <MenuDocs submenu={submenu} onNavClick={handleNavClick} />
            <SubNavContainer isDocsSection={isDocs}>
              <HeaderSubNavigation showLabels={!isDocs} />
            </SubNavContainer>
          </MobileMenu>
        </Dialog.Content>
      </>
    ) : null
  )
}

const MobileMenuOverlay = styled(animated.div, {
  position: 'fixed',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  width: '100vw',
  height: '100vh',
  zIndex: '$1',
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
  backdropFilter: 'blur(5px)',

  '@supports not (backdrop-filter: blur(10px))': {
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
})

const MobileMenu = styled(animated.div, {
  position: 'fixed',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  height: '100vh',
  width: '30rem',
  background: '$white',
  zIndex: '$1',
  boxShadow: '3px 0 12px -10px rgba(0,0,0,0.5)',
  padding: '$25 0 $10',
  display: 'flex',
  flexDirection: 'column',
})

const MobileMenuClose = styled(Dialog.Close, {
  border: 'none',
  color: '$steel100',
  background: 'transparent',
  mb: '$20',
  ml: '$15',
  p: '1.1rem 1.2rem',
  cursor: 'pointer',
})

const HiddenTitle = styled(Dialog.Title, {
  visuallyHidden: '',
})

const MainNavigation = styled(HeaderNavigation, {
  mx: '$10',
  pb: '$20',

  variants: {
    isDocsSection: {
      true: {
        borderBottom: 'solid 1px $steel20',
      },
      false: {
        flexDirection: 'column',
        alignItems: 'flex-start',
      },
    },
  },
})

const SubNavContainer = styled(Toolbar.Root, {
  listStyle: 'none',
  margin: '0 $10',
  padding: 0,
  display: 'flex',
  gap: '$10',
  pt: '$10',

  variants: {
    isDocsSection: {
      true: {
        alignItems: 'center',
        borderTop: 'solid 1px $steel20',
      },
      false: {
        alignItems: 'flex-start',
        flexDirection: 'column',
      },
    },
  },
})
