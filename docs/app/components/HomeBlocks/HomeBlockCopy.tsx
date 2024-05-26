import { ReactNode } from 'react'

import { GradientButton } from '../Buttons/GradientButton'
import { Copy } from '../Text/Copy'
import { GradientHeader } from '../Text/GradientHeader'
import { Heading } from '../Text/Heading'
import { block, blockCopy } from './HomeBlockCopy.css'

interface HomeBlockCopyProps {
  subtitle: string
  title: string
  children: ReactNode
  cta?: {
    label: string
    href: string
  }
}

export const HomeBlockCopy = ({
  subtitle,
  title,
  children,
  cta,
}: HomeBlockCopyProps) => (
  <div className={block}>
    <GradientHeader tag="h2" fontStyle="XXS" weight="bold">
      {subtitle}
    </GradientHeader>
    <Heading tag="h3" fontStyle="XL">
      {title}
    </Heading>
    <Copy className={blockCopy} tag="div" fontStyle="S">
      {children}
    </Copy>
    {cta ? <GradientButton href={cta.href}>{cta.label}</GradientButton> : null}
  </div>
)
