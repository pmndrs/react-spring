import { Link, useLocation } from '@remix-run/react'
import { Location } from 'react-router'

import { getFontStyles } from '~/styles/fontStyles'
import { css, styled } from '~/styles/stitches.config'

import {
  NavigationSchema,
  NavigationSchemaItem,
} from '../../../scripts/docs/navigation'
import { WidgetSearch } from '../Widgets/WidgetSearch'
import { BadgeNew } from '../BadgeNew'

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

  const isDocs = location.pathname.includes('docs')

  return (
    <DocsList>
      <WidgetContainer shouldBeHidden={!isDocs}>
        <WidgetSearch />
      </WidgetContainer>
      <ScrollArea>
        {Array.isArray(submenu) &&
          submenu.map(item =>
            renderSubMenu({ ...item, location, onClick: handleNavClick }, 0)
          )}
        <ExternalAnchor
          shouldBeHidden={!isDocs}
          href="https://github.com/pmndrs/react-spring/releases"
          rel="noopener noreferrer"
          target="_blank"
          title={true}
          active={false}
          onClick={handleNavClick}>
          {`Changelog`}
        </ExternalAnchor>
      </ScrollArea>
    </DocsList>
  )
}

interface SubMenuSchema extends NavigationSchemaItem {
  location: Location
  onClick?: () => void
}

const renderSubMenu = (
  {
    children,
    id,
    title,
    href,
    location,
    onClick,
    noPage,
    isNew,
  }: SubMenuSchema,
  level: number
) => {
  const handleClick = () => {
    if (onClick) {
      onClick()
    }
  }
  const hasRenderableChildren = children.length > 0

  const isTitle = level === 0

  const doesNotWantPage = Boolean(noPage)

  return (
    <ListItem key={id}>
      {!doesNotWantPage ? (
        <Anchor
          to={href}
          title={isTitle}
          active={location.pathname === href}
          onClick={handleClick}>
          <span>{title}</span>
          {isNew ? <BadgeNew /> : null}
        </Anchor>
      ) : (
        <Anchor title={isTitle} as="span" hasNoLink>
          <span>{title}</span>
          {isNew ? <BadgeNew /> : null}
        </Anchor>
      )}
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
    overflowY: 'unset',
    height: '100%',
    pl: '$50',
    pr: '$25',
    py: 4,
    mt: -4,
  },
})

const ScrollArea = styled('div', {
  '@tabletUp': {
    maxHeight: '100%',
    overflowY: 'scroll',
    pb: '$60',
  },
})

const ListItem = styled('li')

const AnchorStyles = css({
  ...getFontStyles('$XS'),

  hover: {
    backgroundColor: '#ff6d6d33',
  },

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  position: 'relative',
  p: '0.5rem 1.2rem',
  borderRadius: '$r8',

  variants: {
    title: {
      true: {
        fontWeight: '$bold',
      },
      false: {
        fontWeight: '$default',
        pl: '$20',
      },
    },
    hasNoLink: {
      true: {
        hover: {
          background: 'transparent',
        },
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
    shouldBeHidden: {
      true: {
        display: 'none',
      },
    },
  },
})

const WidgetContainer = styled('li', {
  variants: {
    shouldBeHidden: {
      true: {
        display: 'none',
      },
    },
  },

  '.DocSearch': {
    fontSize: '$XS',
    color: '$steel40',
  },

  '.DocSearch-Container, .DocSearch-Container *': {
    pointerEvents: 'auto',
  },

  '.DocSearch-Button': {
    borderRadius: '$r8',
    margin: 0,
    padding: '$5 11px',
    width: '100%',
    marginBottom: '$10',
    backgroundColor: 'transparent',
    border: '1px solid $steel40',
    alignItems: 'center',

    hover: {
      background: 'transparent',
      boxShadow: 'unset',
      borderColor: '$red100',
    },
  },

  '.DocSearch-Button-Placeholder': {
    fontSize: '$XS',
    padding: 0,
    display: 'unset',
  },

  '.DocSearch-Search-Icon': {
    display: 'none',
  },

  '.DocSearch-Button-Keys': {
    justifyContent: 'flex-end',
  },

  '.DocSearch-Button-Key': {
    border: 'none',
    background: 'transparent',
    boxShadow: 'unset',
    width: 'unset',
    height: 'unset',
    padding: 0,
    margin: 0,
    color: '$steel60',
    fontFamily: '$sans-var',
  },
})

const ExternalAnchor = styled('a', AnchorStyles)

const Anchor = styled(Link, AnchorStyles)
