import { ReactNode } from 'react'
import { Link } from '@remix-run/react'

import { isValidHttpUrl } from '~/helpers/strings'
import clsx from 'clsx'
import { anchor } from './Anchor.css'

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
      <a
        className={clsx(anchor, className)}
        href={href}
        rel="noopener noreferrer"
        target="_blank"
        onClick={handleClick}
      >
        {children}
      </a>
    )
  } else {
    return (
      <Link className={clsx(anchor, className)} onClick={handleClick} to={href}>
        {children}
      </Link>
    )
  }
}
