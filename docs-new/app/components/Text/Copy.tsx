import { forwardRef, ReactNode } from 'react'
import { getFontStyles } from '~/styles/fontStyles'

import { styled, ScaleValue, CSS } from '~/styles/stitches.config'

export interface CopyProps {
  fontStyle?: ScaleValue<'fontSizes'>
  className?: string
  children?: ReactNode
  css?: CSS
  tag?: keyof Pick<JSX.IntrinsicElements, 'p' | 'blockquote' | 'div'>
}

export const Copy = forwardRef<HTMLHeadingElement, CopyProps>(
  ({ fontStyle = '$XS', className, children, css, tag = 'p' }, ref) => {
    return (
      <Text
        className={className}
        as={tag}
        ref={ref}
        css={{
          ...getFontStyles(fontStyle),
          ...css,
        }}>
        {children}
      </Text>
    )
  }
)

const Text = styled('p', {
  margin: 0,
  fontWeight: '$default',
})
