import { forwardRef, Fragment, ReactNode } from 'react'
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

interface DescriptiveListProps {
  data: [title: string, item: ReactNode][]
}

export const DescriptiveList = ({ data }: DescriptiveListProps) => {
  return (
    <Dl>
      {data.map(datum => (
        <div key={datum[0]}>
          <dt>{`${datum[0]} –`}</dt>
          <dd>{datum[1]}</dd>
        </div>
      ))}
    </Dl>
  )
}

const Dl = styled('dl', {
  ...getFontStyles('$XS'),

  '& code': {
    backgroundColor: '$steel20',
    borderRadius: '$r4',
    py: 2,
    px: 5,
  },

  '& > div': {
    display: 'flex',
    gap: '$5',
  },

  '& dt': {
    mb: '$5',
    fontWeight: '$regular',
  },

  '& dd': {
    margin: 0,
    mb: '$15',
  },
})
