import { Link, useLocation } from 'remix'
import { Location } from 'react-router'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'phosphor-react'
import { animated, useTransition } from '@react-spring/web'
import * as Toolbar from '@radix-ui/react-toolbar'

import { styled } from '~/styles/stitches.config'
import { getFontStyles } from '~/styles/fontStyles'

import { HeaderNavigation } from './HeaderNavigation'
import { HeaderSubNavigation } from './HeaderSubNavigation'

import {
  NavigationSchema,
  NavigationSchemaItem,
} from '../../../scripts/docs/navigation'

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
            <MobileSubMenu>
              {isDocs &&
                Array.isArray(submenu) &&
                submenu.map(item => renderSubMenu({ ...item, location }, 0))}
            </MobileSubMenu>
            <SubNavContainer isDocsSection={isDocs}>
              <HeaderSubNavigation
                onClick={handleNavClick}
                showLabels={!isDocs}
              />
            </SubNavContainer>
          </MobileMenu>
        </Dialog.Content>
      </>
    ) : null
  )
}

interface SubMenuSchema extends NavigationSchemaItem {
  location: Location
}

const renderSubMenu = (
  { children, id, title, href, location }: SubMenuSchema,
  level: number
) => {
  const hasRenderableChildren = children.length > 0
  return (
    <li key={id}>
      <Anchor
        to={!hasRenderableChildren ? href : ''}
        title={level === 0}
        active={location.pathname === href}>
        {title}
      </Anchor>
      {hasRenderableChildren ? (
        <ul>
          {children.map(item =>
            renderSubMenu({ ...item, location }, level + 1)
          )}
        </ul>
      ) : null}
    </li>
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
  zIndex: '$2',
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
  zIndex: '$3',
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

const MobileSubMenu = styled('ul', {
  m: 0,
  p: '$15 $10',
  listStyle: 'none',
  ...getFontStyles('$XS'),
  overflowY: 'auto',
  flexShrink: 1,
  flexGrow: 1,

  '& ul': {
    m: 0,
    p: 0,
    listStyle: 'none',
  },
})

const Anchor = styled(Link, {
  '@media (hover: hover)': {
    '&:hover': {
      backgroundColor: '$red20',
    },
  },

  display: 'block',
  position: 'relative',
  p: '0.5rem 1.2rem',
  borderRadius: '$r8',

  variants: {
    title: {
      true: {
        fontWeight: '$bold',
      },
    },
    active: {
      true: {
        backgroundColor: '$red60',
      },
    },
  },
})

const MainNavigation = styled(HeaderNavigation, {
  mx: '$10',
  pb: '$20',

  variants: {
    isDocsSection: {
      true: {
        borderBottom: 'solid 1px $grey',
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
        borderTop: 'solid 1px $grey',
      },
      false: {
        alignItems: 'flex-start',
        flexDirection: 'column',
      },
    },
  },
})
