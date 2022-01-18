import { DiscordLogo, House, GithubLogo, Code, Files } from 'phosphor-react'
import * as Toolbar from '@radix-ui/react-toolbar'
import * as Tooltip from '@radix-ui/react-tooltip'

import { dark, styled } from '~/styles/stitches.config'
import { NavigationButton, NavigationButtonProps } from '../Buttons/NavButton'

interface NavigationProps {
  className?: string
  showSubNav?: boolean
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
  {
    title: 'Examples',
    href: '/examples',
    Icon: Code,
  },
]

const SUB_NAV: NavigationButtonProps[] = [
  {
    title: 'Source',
    href: 'https://github.com/pmndrs/react-spring',
    isExternal: true,
    Icon: GithubLogo,
  },
  {
    title: 'Discord',
    href: 'https://discord.com/invite/poimandres',
    isExternal: true,
    Icon: DiscordLogo,
  },
]

export const HeaderNavigation = ({
  className,
  showSubNav = true,
}: NavigationProps) => {
  return (
    <Tooltip.TooltipProvider>
      <NavList className={className}>
        {MAIN_NAV.map(props => (
          <NavigationButton key={props.title} {...props} />
        ))}
        {showSubNav && <NavSeperator />}
        {showSubNav &&
          SUB_NAV.map(props => (
            <NavigationButton key={props.title} {...props} />
          ))}
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
  background: '$grey',
  margin: '0 $15',
  height: '2rem',

  [`.${dark} &`]: {
    background: '$steel',
  },
})
