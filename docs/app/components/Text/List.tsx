import { forwardRef, ReactNode } from 'react'
import { getFontStyles } from '~/styles/fontStyles'

import { styled, CSS, ScaleValue } from '~/styles/stitches.config'

export interface ListProps {
  tag?: keyof Pick<JSX.IntrinsicElements, 'ul' | 'ol'>
  fontStyle?: ScaleValue<'fontSizes'>
  className?: string
  children?: ReactNode
  css?: CSS
}

export const List = forwardRef<HTMLUListElement, ListProps>(
  ({ tag = 'ul', fontStyle = '$XS', className, children, css }, ref) => {
    return (
      <ListElement
        className={className}
        ref={ref}
        as={tag}
        css={{
          ...getFontStyles(fontStyle),
          ...css,
        }}>
        {children}
      </ListElement>
    )
  }
)

const ListElement = styled('ul', {
  pl: '$20',
  fontWeight: '$default',

  '& code': {
    backgroundColor: '$steel20',
    borderRadius: '$r4',
    py: 2,
    px: 5,
  },
})
