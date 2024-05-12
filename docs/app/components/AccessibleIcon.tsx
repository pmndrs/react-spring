import { Children, cloneElement, ReactNode } from 'react'
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
  const child = Children.only(children)
  return (
    <>
      {cloneElement(child as React.ReactElement, {
        'aria-hidden': 'true',
        focusable: 'false',
        className,
      })}
      <span className={visuallyHidden}>{label}</span>
    </>
  )
}
