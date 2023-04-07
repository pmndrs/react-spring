import * as React from 'react'
import { House, Files, Code } from 'phosphor-react'
import * as Toolbar from '@radix-ui/react-toolbar'
import * as Tooltip from '@radix-ui/react-tooltip'

import { styled } from '~/styles/stitches.config'
import { NavigationButton, NavigationButtonProps } from '../Buttons/NavButton'
import { HeaderSubNavigation } from './HeaderSubNavigation'
import { SiteThemePicker } from '../Site/SiteThemePicker'

interface NavigationProps {
  className?: string
  showSubNav?: boolean
  showLabels?: boolean
  showThemePicker?: boolean
}

const MAIN_NAV: NavigationButtonProps[] = [
  {
    title: 'Home',
    href: '/',
    Icon: House,
  },
  {
    title: 'Docs',
    href: '/docs',
    Icon: Files,
  },
  // {
  //   title: 'Tutorials',
  //   href: '/tutorials',
  //   Icon: Books,
  // },
  {
    title: 'Examples',
    href: '/examples',
    Icon: Code,
  },
]

export const HeaderNavigation = ({
  className,
  showSubNav = true,
  showLabels = false,
  showThemePicker = true,
}: NavigationProps) => {
  return (
    <Tooltip.TooltipProvider>
      <NavList className={className}>
        {MAIN_NAV.map(props => (
          <NavigationButton
            showLabel={showLabels}
            key={props.title}
            {...props}
          />
        ))}
        {showSubNav && (
          <>
            <NavSeperator />
            <HeaderSubNavigation showLabels={showLabels} />
          </>
        )}
        {showThemePicker && (
          <>
            <NavSeperator />
            <SiteThemePicker />
          </>
        )}
      </NavList>
    </Tooltip.TooltipProvider>
  )
}

const NavList = styled(Toolbar.Root, {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  alignItems: 'center',
  gap: '$10',
})

const NavSeperator = styled(Toolbar.Separator, {
  width: '0.1rem',
  background: '$steel40',
  margin: '0 $15',
  height: '2rem',
})
