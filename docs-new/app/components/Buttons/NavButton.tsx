import {
  ForwardRefExoticComponent,
  MouseEventHandler,
  RefAttributes,
  useRef,
  useState,
} from 'react'
import { Link, useLocation } from 'remix'
import {
  animated,
  SpringValue,
  useSpring,
  useTransition,
} from '@react-spring/web'
import * as Toolbar from '@radix-ui/react-toolbar'
import * as Tooltip from '@radix-ui/react-tooltip'
import { IconProps } from 'phosphor-react'

import { dark, styled } from '~/styles/stitches.config'
import { getFontStyles } from '~/styles/fontStyles'
import { useIsDarkTheme } from '~/hooks/useIsDarkTheme'

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
    <NavAnchor
      onClick={handleClick}
      href={href}
      variant={showLabel ? 'withLabel' : undefined}
      active={isRoute}
      {...externalLinkProps}>
      <NavIconWrapper
        css={{
          color: isRoute ? 'var(--colors-steel100)' : 'unset',
          [`.${dark} &`]: {
            color: isRoute ? '#363645' : 'unset',
          },
        }}>
        <Icon size={20} weight={isDarkMode ? 'light' : 'regular'} />
        {showLabel ? <span>{title}</span> : null}
      </NavIconWrapper>
    </NavAnchor>
  )
}

const NavAnchor = styled('a', {
  height: '4.6rem',
  width: '4.6rem',
  color: '$steel100',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  borderRadius: '$r8',
  p: 2,
  backgroundClip: 'content-box',

  '&:before': {
    content: '',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: -1,
    borderRadius: 'inherit',
    opacity: 0,
    background: '$redYellowGradient100',

    '@motion': {
      transition: 'opacity 250ms ease-out',
    },
  },

  variants: {
    active: {
      true: {
        background: '$redYellowGradient100',
      },
      false: {
        backgroundColor: '$white',

        hover: {
          '&::before': {
            opacity: 1,
          },
        },
      },
    },
    variant: {
      withLabel: {
        width: '100%',
        justifyContent: 'flex-start',
      },
    },
  },
})

const NavIconWrapper = styled('span', {
  position: 'relative',
  zIndex: '$2',
  display: 'flex',
  m: '$15',

  '& > span': {
    ...getFontStyles('$XXS'),
    fontWeight: '$bold',
    ml: '$15',
  },
})
