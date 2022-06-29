import { ReactNode } from 'react'
import { Link } from 'remix'

import { isValidHttpUrl } from '~/helpers/strings'
import { styled } from '~/styles/stitches.config'

export interface AnchorProps {
  href: string
  children: ReactNode
  className?: string
}

export const Anchor = ({ href, children, className }: AnchorProps) => {
  const isExternal = isValidHttpUrl(href)

  if (isExternal) {
    return (
      <AnchorElement
        className={className}
        as="a"
        href={href}
        rel="noopener noreferrer"
        target="_blank">
        {children}
      </AnchorElement>
    )
  } else {
    return <AnchorElement to={href}>{children}</AnchorElement>
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
