import {
  Children,
  cloneElement,
  HTMLAttributes,
  ReactElement,
  ReactNode,
} from 'react'
import { visuallyHidden } from '../styles/utilities.css'

interface AccessibleIconProps {
  children: ReactNode
  label: string
  className?: string
}

export const AccessibleIcon = ({
  children,
  label,
  className,
}: AccessibleIconProps) => {
  const child = Children.only(children) as ReactElement<
    HTMLAttributes<HTMLElement>
  >
  return (
    <>
      {cloneElement(child, {
        'aria-hidden': 'true',
        focusable: 'false',
        className,
      } as HTMLAttributes<HTMLElement>)}
      <span className={visuallyHidden}>{label}</span>
    </>
  )
}
