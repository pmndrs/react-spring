import { ReactNode } from 'react'
import { styled } from '~/styles/stitches.config'
import { GradientButton } from '../Buttons/GradientButton'

import { Copy } from '../Text/Copy'
import { GradiantHeader } from '../Text/GradientHeader'
import { Heading } from '../Text/Heading'

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
  <Block>
    <GradiantHeader tag="h2" fontStyle="$XXS" weight="$bold">
      {subtitle}
    </GradiantHeader>
    <Heading tag="h3" fontStyle="$XL">
      {title}
    </Heading>
    <BlockCopy tag="div" fontStyle="$S">
      {children}
    </BlockCopy>
    {cta ? <GradientButton href={cta.href}>{cta.label}</GradientButton> : null}
  </Block>
)

const Block = styled('div', {
  maxWidth: 630,
})

const BlockCopy = styled(Copy, {
  py: '$20',
  maxWidth: 600,
})
