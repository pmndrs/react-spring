import { CheckCircle, Fire, Note, Warning } from 'phosphor-react'
import { ReactNode } from 'react'
import { capitalize } from '~/helpers/strings'
import { getFontStyles } from '~/styles/fontStyles'

import { styled } from '~/styles/stitches.config'

interface CalloutProps {
  children?: ReactNode
  variant?: 'warning' | 'danger' | 'success' | 'note'
}

const icons = {
  warning: Warning,
  danger: Fire,
  success: CheckCircle,
  note: Note,
}

export const Callout = ({ children, variant = 'warning' }: CalloutProps) => {
  const Icon = icons[variant]

  return (
    <CalloutWrapper variant={variant}>
      <Label variant={variant}>
        <Icon size={20} weight="bold" />
        {capitalize(variant)}
      </Label>
      {children}
    </CalloutWrapper>
  )
}

const CalloutWrapper = styled('div', {
  borderRadius: '$r8',
  px: '$30',
  py: '$30',
  my: '$20',

  '& + pre': {
    mt: '$40',
  },

  variants: {
    variant: {
      warning: {
        backgroundColor: '#FF701933',
      },
      danger: {
        backgroundColor: 'red',
      },
      success: {
        backgroundColor: 'green',
      },
      note: {
        background: '#569AFF33',
      },
    },
  },
})

const Label = styled('div', {
  ...getFontStyles('$S'),
  fontWeight: '$semiblack',
  mb: '$15',
  display: 'flex',
  gap: '$5',
  alignItems: 'center',

  variants: {
    variant: {
      warning: {
        color: '#FF7019CC',
      },
      danger: {
        color: '#FF7019CC',
      },
      success: {
        color: '#FF7019CC',
      },
      note: {
        color: '#569AFF',
      },
    },
  },
})
