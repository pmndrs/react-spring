import { DiscordLogo, GithubLogo, Lifebuoy } from 'phosphor-react'
import { EventNames, firePlausibleEvent } from '~/helpers/analytics'

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
  const handleClick = (label: string) => () => {
    firePlausibleEvent({
      name: EventNames.OutboundLink,
      additionalProps: {
        linkTitle: label,
      },
    })
  }

  return (
    <>
      {SUB_NAV.map(props => (
        <NavigationButton
          key={props.title}
          showLabel={showLabels}
          onClick={handleClick(props.title)}
          {...props}
        />
      ))}
    </>
  )
}
