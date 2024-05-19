import { Link, useLocation } from '@remix-run/react'
import { Location } from 'react-router'

import {
  NavigationSchema,
  NavigationSchemaItem,
} from '../../../scripts/docs/navigation'
import { WidgetSearch } from '../Widgets/WidgetSearch'
import { BadgeNew } from '../BadgeNew'
import {
  anchorActive,
  anchorHasNoLink,
  anchorStyles,
  anchorTitle,
  docsList,
  scrollArea,
  widgetContainer,
} from './MenuDocs.css'
import clsx from 'clsx'

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
    <ul className={docsList}>
      <li
        className={widgetContainer}
        style={{ display: !isDocs ? 'none' : 'flex' }}
      >
        <WidgetSearch />
      </li>
      <div className={scrollArea}>
        {Array.isArray(submenu) &&
          submenu.map(item =>
            renderSubMenu({ ...item, location, onClick: handleNavClick }, 0)
          )}
        <li>
          <a
            className={clsx(anchorStyles, anchorTitle)}
            style={{ display: !isDocs ? 'none' : 'flex' }}
            href="https://github.com/pmndrs/react-spring/releases"
            rel="noopener noreferrer"
            target="_blank"
            onClick={handleNavClick}
          >
            {`Changelog`}
          </a>
        </li>
      </div>
    </ul>
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
    <li key={id}>
      {!doesNotWantPage ? (
        <Link
          to={href}
          className={clsx(
            anchorStyles,
            isTitle && anchorTitle,
            location.pathname === href && anchorActive
          )}
          onClick={handleClick}
        >
          <span>{title}</span>
          {isNew ? <BadgeNew /> : null}
        </Link>
      ) : (
        <span
          className={clsx(
            anchorStyles,
            isTitle && anchorTitle,
            anchorHasNoLink
          )}
        >
          <span>{title}</span>
          {isNew ? <BadgeNew /> : null}
        </span>
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
    </li>
  )
}
