import { Link } from 'remix'

import { isValidHttpUrl } from '~/helpers/strings'
import { styled } from '~/styles/stitches.config'

export interface AnchorProps {
  href: string
  children: string
}

export const Anchor = ({ href, children }: AnchorProps) => {
  const isExternal = isValidHttpUrl(href)

  if (isExternal) {
    return (
      <AnchorElement
        as="a"
        href={href}
        rel="noopener norefferer"
        target="_blank">
        {children}
      </AnchorElement>
    )
  } else {
    return <AnchorElement to={href}>{children}</AnchorElement>
  }
}

const AnchorElement = styled(Link, {
  fontSize: 'inherit',
  lineHeight: 'inherit',
  fontWeight: 600,
  textDecoration: 'underline',
})
