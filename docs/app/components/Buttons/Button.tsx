import { MouseEventHandler, ReactNode, forwardRef } from 'react'
import { Link } from '@remix-run/react'
import clsx from 'clsx'
import { sharedStyles } from './Button.css'

interface ButtonProps {
  children: ReactNode
  className?: string
  type?: 'button' | 'submit'
  onClick?: MouseEventHandler<HTMLButtonElement>
  disabled?: boolean
  href?: string
  variant?: 'regular' | 'large'
}

export const Button = forwardRef(
  (
    {
      children,
      className,
      type = 'button',
      onClick,
      disabled = false,
      href,
      variant = 'regular',
    }: ButtonProps,
    forwardedRef: any
  ) => {
    const handleClick: MouseEventHandler<HTMLButtonElement> = e => {
      if (onClick) {
        onClick(e)
      }
    }

    if (href) {
      return (
        <Link
          ref={forwardedRef}
          className={clsx(
            sharedStyles({
              variant,
            }),
            className
          )}
          to={href}
        >
          {children}
        </Link>
      )
    }

    return (
      <button
        ref={forwardedRef}
        className={clsx(
          sharedStyles({
            variant,
          }),
          className
        )}
        type={type}
        onClick={handleClick}
        disabled={disabled}
      >
        {children}
      </button>
    )
  }
)
