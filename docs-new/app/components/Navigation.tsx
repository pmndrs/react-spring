import {
  ChatBubbleIcon,
  CodeIcon,
  FileTextIcon,
  GitHubLogoIcon,
  HomeIcon,
} from '@radix-ui/react-icons'
import * as Toolbar from '@radix-ui/react-toolbar'
import { ExoticComponent, ReactNode } from 'react'

import { styled } from '~/styles/stitches.config'

interface NavigationProps {
  className?: string
}

const MAIN_NAV: NavigationButtonProps[] = [
  {
    title: 'Home',
    href: '/',
    Icon: HomeIcon,
  },
  {
    title: 'Docs',
    href: '/docs',
    Icon: FileTextIcon,
  },
  {
    title: 'Examples',
    href: '/examples',
    Icon: CodeIcon,
  },
]

const SUB_NAV: NavigationButtonProps[] = [
  {
    title: 'Source',
    href: 'https://github.com/pmndrs/react-spring',
    isExternal: true,
    Icon: GitHubLogoIcon,
  },
  {
    title: 'Discord',
    href: '',
    isExternal: true,
    Icon: ChatBubbleIcon,
  },
]

interface NavigationButtonProps {
  title: string
  href: string
  Icon: ExoticComponent
  isExternal?: boolean
}

const NavigationButton = ({
  Icon,
  title,
  href,
  isExternal,
}: NavigationButtonProps) => {
  const externalLinkProps = isExternal
    ? {
        rel: 'noopener noreferrer',
        target: '_blank',
      }
    : {}

  return (
    <NavAnchor href={href} {...externalLinkProps}>
      <Icon />
    </NavAnchor>
  )
}

export const Navigation = ({ className }: NavigationProps) => {
  return (
    <NavList className={className}>
      {MAIN_NAV.map(props => (
        <NavigationButton key={props.title} {...props} />
      ))}
      <NavSeperator />
      {SUB_NAV.map(props => (
        <NavigationButton key={props.title} {...props} />
      ))}
    </NavList>
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

const NavAnchor = styled(Toolbar.Link, {
  padding: '$15',
  borderRadius: '$r8',
  color: '$steel',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
})

const NavSeperator = styled(Toolbar.Separator, {
  width: '0.1rem',
  background: '#ddd',
  margin: '0 $15',
  height: '2rem',
})
