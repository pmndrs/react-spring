import { forwardRef, ReactNode } from 'react'
import { getFontStyles } from '~/styles/fontStyles'

import { styled, ScaleValue, CSS } from '~/styles/stitches.config'

export interface CopyProps {
  fontStyle?: ScaleValue<'fontSizes'>
  className?: string
  children?: ReactNode
  css?: CSS
}

export const Copy = forwardRef<HTMLHeadingElement, CopyProps>(
  ({ fontStyle = '$XS', className, children, css }, ref) => {
    return (
      <Text
        className={className}
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

const Text = styled('p', {})
