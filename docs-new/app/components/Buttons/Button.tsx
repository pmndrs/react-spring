import { MouseEventHandler, ReactNode } from 'react'
import { styled } from '~/styles/stitches.config'

interface ButtonProps {
  children: ReactNode
  className?: string
  type?: 'button' | 'submit'
  onClick?: MouseEventHandler<HTMLButtonElement>
  disabled?: boolean
}

export const Button = ({
  children,
  className,
  type = 'button',
  onClick,
  disabled = false,
}: ButtonProps) => {
  const handleClick: MouseEventHandler<HTMLButtonElement> = e => {
    if (onClick) {
      onClick(e)
    }
  }

  return (
    <StyledButton
      className={className}
      type={type}
      onClick={handleClick}
      disabled={disabled}>
      {children}
    </StyledButton>
  )
}

const StyledButton = styled('button', {
  border: 'solid 1px $black',
  backgroundColor: 'transparent',
  borderRadius: '$r4',
  fontFamily: '$sans',
  fontSize: '$XXS',
  lineHeight: '$code',
  padding: '5px $10',
  cursor: 'pointer',

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
})
