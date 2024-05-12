import {
  ForwardRefExoticComponent,
  MouseEventHandler,
  RefAttributes,
} from 'react'
import { Link, useLocation } from '@remix-run/react'
import * as Toolbar from '@radix-ui/react-toolbar'
import { IconProps } from 'phosphor-react'

import { useIsDarkTheme } from '~/hooks/useIsDarkTheme'
import { navAnchor, navIconLabel, navIconWrapper } from './NavButton.css'

export interface NavigationButtonProps {
  title: string
  href: string
  Icon: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>
  isExternal?: boolean
  showLabel?: boolean
  onClick?: MouseEventHandler<HTMLAnchorElement>
}

export const NavigationButton = ({
  Icon,
  title,
  href,
  isExternal,
  showLabel = false,
  onClick,
}: NavigationButtonProps) => {
  const { pathname } = useLocation()

  const isRoute = (href !== '/' && pathname.includes(href)) || pathname === href

  const handleClick: MouseEventHandler<HTMLAnchorElement> = e => {
    if (onClick) {
      onClick(e)
    }
  }

  const externalLinkProps = isExternal
    ? {
        rel: 'noopener noreferrer',
        target: '_blank',
      }
    : {}

  const isDarkMode = useIsDarkTheme()

  /**
   * TODO: refactor to use `Link` component
   */
  return (
    <Toolbar.Link
      onClick={handleClick}
      href={href}
      className={navAnchor({
        active: isRoute,
        variant: showLabel ? 'withLabel' : undefined,
      })}
      asChild
      {...externalLinkProps}
    >
      <Link to={href}>
        <span
          className={navIconWrapper({
            isRoute,
          })}
        >
          <Icon size={20} weight={isDarkMode ? 'light' : 'regular'} />
          {showLabel ? <span className={navIconLabel}>{title}</span> : null}
        </span>
      </Link>
    </Toolbar.Link>
  )
}
