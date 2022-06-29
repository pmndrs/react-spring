import { css } from '@stitches/react'
import { MouseEventHandler, ReactNode } from 'react'
import { Link } from '@remix-run/react'
import { styled } from '~/styles/stitches.config'

interface ButtonProps {
  children: ReactNode
  className?: string
  type?: 'button' | 'submit'
  onClick?: MouseEventHandler<HTMLButtonElement>
  disabled?: boolean
  href?: string
  variant?: 'regular' | 'large'
}

export const Button = ({
  children,
  className,
  type = 'button',
  onClick,
  disabled = false,
  href,
  variant = 'regular',
}: ButtonProps) => {
  const handleClick: MouseEventHandler<HTMLButtonElement> = e => {
    if (onClick) {
      onClick(e)
    }
  }

  if (href) {
    return (
      <StyledLink className={className} to={href} variant={variant}>
        {children}
      </StyledLink>
    )
  }

  return (
    <StyledButton
      className={className}
      type={type}
      onClick={handleClick}
      disabled={disabled}
      variant={variant}>
      {children}
    </StyledButton>
  )
}

const sharedStyles = css({
  border: 'solid 1px $black',
  backgroundColor: 'transparent',
  borderRadius: '$r4',
  fontFamily: '$sans',
  fontSize: '$XXS',
  lineHeight: '$code',
  padding: '5px $10',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',

  '@motion': {
    transition: 'border-color 200ms ease-out',
  },

  hover: {
    borderColor: '$red100',
  },

  '&:disabled': {
    pointerEvents: 'none',
    opacity: 0.5,
  },

  variants: {
    variant: {
      regular: {},
      large: {
        p: '11px 9px 11px 12px',
        borderRadius: '$r8',
      },
    },
  },
})

const StyledLink = styled(Link, { ...sharedStyles })

const StyledButton = styled('button', { ...sharedStyles })
