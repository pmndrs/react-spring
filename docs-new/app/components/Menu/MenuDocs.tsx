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

  const isTitle = level === 0

  return (
    <ListItem key={id}>
      <Anchor
        to={href}
        title={isTitle}
        active={location.pathname === href}
        onClick={handleClick}>
        {title}
      </Anchor>
      {/* {!hasRenderableChildren ? (
      ) : (
        <AnchorLike title={level === 0}>{title}</AnchorLike>
      )} */}
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
    </ListItem>
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
    py: 4,
    mt: -4,
  },
})

const ListItem = styled('li')

const Anchor = styled(Link, {
  ...getFontStyles('$XS'),

  hover: {
    backgroundColor: '#ff6d6d33',
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
      false: {
        pl: '$20',
      },
    },
    active: {
      true: {
        backgroundColor: '#ff6d6d99',

        hover: {
          backgroundColor: '#ff6d6d99',
        },
      },
    },
  },
})
