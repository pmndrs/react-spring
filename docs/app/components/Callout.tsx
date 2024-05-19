import clsx from 'clsx'
import { CheckCircle, Fire, Note, Warning } from 'phosphor-react'
import { ReactNode } from 'react'
import { capitalize } from '~/helpers/strings'
import { S } from '../styles/fontStyles.css'
import { calloutWrapper, label } from './Callout.css'

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
    <div
      className={calloutWrapper({
        type: variant,
      })}
    >
      <div className={clsx(S, label({ type: variant }))}>
        <Icon size={20} weight="bold" />
        {capitalize(variant)}
      </div>
      {children}
    </div>
  )
}
