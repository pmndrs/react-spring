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

  const [{ scale }, api] = useSpring(
    () => ({
      scale: 0,
    }),
    []
  )

  const handleMouseEnter = () => {
    api.start({
      scale: isRoute || window.innerWidth < 768 ? 0 : 1,
    })
  }

  const handleMouseLeave = () => {
    api.start({
      scale: 0,
    })
  }

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

  const animateInterpolation = (val: SpringValue<number>) =>
    val.to({ range: [0, 1], output: [1.05, 0.8] })

  /**
   * TODO: refactor to use `Link` component
   */
  return (
    <NavAnchor
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      href={href}
      variant={showLabel ? 'withLabel' : undefined}
      {...externalLinkProps}>
      <NavAnchorPlainBackground
        style={{
          scale: isRoute ? scale : animateInterpolation(scale),
          x: '-50%',
          y: '-50%',
        }}
      />
      <NavIconWrapper
        css={{
          color: isRoute ? 'var(--colors-steel100)' : 'unset',
          [`.${dark} &`]: {
            color: isRoute ? '#363645' : 'unset',
          },
        }}>
        <Icon size={20} weight="light" />
        {showLabel ? <span>{title}</span> : null}
      </NavIconWrapper>
    </NavAnchor>
  )
}

const NavAnchor = styled('a', {
  padding: '$15',
  height: '4.6rem',
  width: '4.6rem',
  color: '$steel100',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  backgroundImage: '$redYellowGradient100',
  borderRadius: '$r8',

  variants: {
    variant: {
      withLabel: {
        width: '100%',
        justifyContent: 'flex-start',
      },
    },
  },
})

const NavAnchorPlainBackground = styled(animated.span, {
  display: 'block',
  position: 'absolute',
  top: '50%',
  left: '50%',
  background: '$white',
  zIndex: '$1',
  borderRadius: '$r8',
  width: '100%',
  height: '100%',
})

const NavIconWrapper = styled('span', {
  position: 'relative',
  zIndex: '$2',
  display: 'flex',

  '& > span': {
    ...getFontStyles('$XXS'),
    fontWeight: '$bold',
    ml: '$15',
  },
})
