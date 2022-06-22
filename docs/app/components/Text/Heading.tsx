import { CSSProperties, forwardRef, ReactNode } from 'react'
import { getFontStyles } from '~/styles/fontStyles'

import { styled, ScaleValue, CSS, dark } from '~/styles/stitches.config'

export interface HeadingProps {
  tag?: keyof Pick<
    JSX.IntrinsicElements,
    'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'figcaption'
  >
  fontStyle?: ScaleValue<'fontSizes'>
  className?: string
  children?: ReactNode
  css?: CSS
  weight?: ScaleValue<'fontWeights'> | CSSProperties['fontWeight']
}

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  (
    {
      tag = 'h1',
      fontStyle = '$S',
      weight = '$default',
      className,
      children,
      css,
      ...restProps
    },
    ref
  ) => {
    return (
      <HeadingElement
        className={className}
        ref={ref}
        as={tag}
        css={{
          fontWeight: weight,
          ...getFontStyles(fontStyle),
          ...css,
        }}
        {...restProps}>
        {children}
      </HeadingElement>
    )
  }
)

const HeadingElement = styled('h1', {
  whiteSpace: 'pre-line',
  a: {
    textDecoration: 'none',
    fontWeight: 'inherit',
  },
})
