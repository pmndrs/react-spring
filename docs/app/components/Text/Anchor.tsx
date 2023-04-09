import { ReactNode } from 'react'
import { Link } from '@remix-run/react'

import { isValidHttpUrl } from '~/helpers/strings'
import { styled } from '~/styles/stitches.config'

export interface AnchorProps {
  href: string
  children: ReactNode
  className?: string
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
}

export const Anchor = ({ href, children, className, onClick }: AnchorProps) => {
  const isExternal = isValidHttpUrl(href)

  const handleClick: React.MouseEventHandler<HTMLAnchorElement> = e => {
    if (onClick) {
      onClick(e)
    }
  }

  if (isExternal) {
    return (
      <AnchorElement
        className={className}
        as="a"
        href={href}
        rel="noopener noreferrer"
        target="_blank"
        onClick={handleClick}
      >
        {children}
      </AnchorElement>
    )
  } else {
    return (
      <AnchorElement onClick={handleClick} to={href}>
        {children}
      </AnchorElement>
    )
  }
}

/**
 * TODO: add anchor hover & active states
 * and maybe a nice animation to go with it
 */
const AnchorElement = styled(Link, {
  fontSize: 'inherit',
  lineHeight: 'inherit',
  fontWeight: '$bold',
  textDecoration: 'underline',
})
