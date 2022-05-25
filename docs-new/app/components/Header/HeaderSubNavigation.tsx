import { DiscordLogo, GithubLogo, Lifebuoy } from 'phosphor-react'

import { NavigationButton, NavigationButtonProps } from '../Buttons/NavButton'

const SUB_NAV: NavigationButtonProps[] = [
  {
    title: 'Github',
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
  {
    title: 'Support',
    href: 'https://opencollective.com/react-spring',
    isExternal: true,
    Icon: Lifebuoy,
  },
]

export interface HeaderSubNavigationProps {
  showLabels?: boolean
}

export const HeaderSubNavigation = ({
  showLabels = false,
}: HeaderSubNavigationProps) => {
  return (
    <>
      {SUB_NAV.map(props => (
        <NavigationButton key={props.title} showLabel={showLabels} {...props} />
      ))}
    </>
  )
}
