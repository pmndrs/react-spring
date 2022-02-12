import { Link, useLocation } from 'remix'
import { Location } from 'react-router'

import { getFontStyles } from '~/styles/fontStyles'
import { styled } from '~/styles/stitches.config'

import {
  NavigationSchema,
  NavigationSchemaItem,
} from '../../../scripts/docs/navigation'

interface MenuDocsProps {
  submenu?: NavigationSchema
  onNavClick?: () => void
}

export const MenuDocs = ({ submenu, onNavClick }: MenuDocsProps) => {
  const location = useLocation()

  const handleNavClick = () => {
    if (onNavClick) {
      onNavClick()
    }
  }

  return (
    <DocsList>
      {Array.isArray(submenu) &&
        submenu.map(item =>
          renderSubMenu({ ...item, location, onClick: handleNavClick }, 0)
        )}
    </DocsList>
  )
}

interface SubMenuSchema extends NavigationSchemaItem {
  location: Location
  onClick?: () => void
}

const renderSubMenu = (
  { children, id, title, href, location, onClick }: SubMenuSchema,
  level: number
) => {
  const handleClick = () => {
    if (onClick) {
      onClick()
    }
  }
  const hasRenderableChildren = children.length > 0
  return (
    <li key={id}>
      <Anchor
        to={!hasRenderableChildren ? href : ''}
        title={level === 0}
        active={location.pathname === href}
        onClick={handleClick}>
        {title}
      </Anchor>
      {hasRenderableChildren ? (
        <ul>
          {children.map(item =>
            renderSubMenu(
              { ...item, location, onClick: handleClick },
              level + 1
            )
          )}
        </ul>
      ) : null}
    </li>
  )
}

const DocsList = styled('ul', {
  m: 0,
  p: '$15 $10',
  listStyle: 'none',
  overflowY: 'auto',
  flexShrink: 1,
  flexGrow: 1,

  '& ul': {
    m: 0,
    p: 0,
    listStyle: 'none',
  },

  '@tabletUp': {
    pl: '$50',
    pr: '$25',
    py: 0,
  },
})

const Anchor = styled(Link, {
  ...getFontStyles('$XS'),

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
