import clsx from 'clsx'
import { forwardRef, ReactNode } from 'react'
import * as FontSizes from '../../styles/fontStyles.css'
import { descriptiveList, list } from './List.css'

export interface ListProps {
  tag?: keyof Pick<React.JSX.IntrinsicElements, 'ul' | 'ol'>
  fontStyle?: keyof FontSizes.FontSizes
  className?: string
  children?: ReactNode
}

export const List = forwardRef<HTMLUListElement | HTMLOListElement, ListProps>(
  ({ tag = 'ul', fontStyle = 'XS', className, children }, ref) => {
    const Element = tag

    return (
      <Element
        className={clsx(FontSizes[fontStyle], list, className)}
        // @ts-expect-error - TODO: polymorphic refs, woo.
        ref={ref}
      >
        {children}
      </Element>
    )
  }
)

interface DescriptiveListProps {
  data: [title: string, item: ReactNode][]
}

export const DescriptiveList = ({ data }: DescriptiveListProps) => {
  return (
    <dl className={descriptiveList}>
      {data.map(datum => (
        <div key={datum[0]}>
          <dt>{`${datum[0]} –`}</dt>
          <dd>{datum[1]}</dd>
        </div>
      ))}
    </dl>
  )
}
