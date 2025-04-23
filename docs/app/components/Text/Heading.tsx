import { CSSProperties, forwardRef, ReactNode } from 'react'

import { Link } from 'phosphor-react'

import { heading, linkIcon } from './Heading.css'
import clsx from 'clsx'
import * as FontSizes from '../../styles/fontStyles.css'

export interface HeadingProps {
  tag?: keyof Pick<
    React.JSX.IntrinsicElements,
    'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'figcaption'
  >
  fontStyle?: keyof FontSizes.FontSizes
  className?: string
  children?: ReactNode
  isLink?: boolean
  weight?: keyof FontSizes.FontWeights
  style?: CSSProperties
}

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  (
    {
      tag = 'h1',
      fontStyle = 'S',
      weight = 'default',
      className,
      children,
      isLink = false,
      ...restProps
    },
    ref
  ) => {
    const Element = tag

    return (
      <Element
        className={clsx(
          FontSizes[fontStyle],
          FontSizes.WEIGHTS[weight],
          heading,
          className
        )}
        ref={ref}
        {...restProps}
      >
        {children}
        {isLink ? <Link className={linkIcon} size={16} /> : null}
      </Element>
    )
  }
)
