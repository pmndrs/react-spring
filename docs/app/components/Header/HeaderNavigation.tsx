import { House, Files, Code } from 'phosphor-react'
import * as Toolbar from '@radix-ui/react-toolbar'
import * as Tooltip from '@radix-ui/react-tooltip'

import { NavigationButton, NavigationButtonProps } from '../Buttons/NavButton'
import { HeaderSubNavigation } from './HeaderSubNavigation'
import { SiteThemePicker } from '../Site/SiteThemePicker'
import clsx from 'clsx'
import { navList, navSeperator } from './HeaderNavigation.css'

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
      <Toolbar.Root className={clsx(navList, className)}>
        {MAIN_NAV.map(props => (
          <NavigationButton
            showLabel={showLabels}
            key={props.title}
            {...props}
          />
        ))}
        {showSubNav && (
          <>
            <Toolbar.Separator className={navSeperator} />
            <HeaderSubNavigation showLabels={showLabels} />
          </>
        )}
        {showThemePicker && (
          <>
            <Toolbar.Separator className={navSeperator} />
            <SiteThemePicker />
          </>
        )}
      </Toolbar.Root>
    </Tooltip.TooltipProvider>
  )
}
