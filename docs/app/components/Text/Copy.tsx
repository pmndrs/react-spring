import clsx from 'clsx'
import { forwardRef, ReactNode } from 'react'

import { copy } from './Copy.css'
import * as FontSizes from '../../styles/fontStyles.css'

export interface CopyProps {
  fontStyle?: keyof FontSizes.FontSizes
  className?: string
  children?: ReactNode
  tag?: keyof Pick<
    React.JSX.IntrinsicElements,
    'p' | 'blockquote' | 'div' | 'label'
  >
}

export const Copy = forwardRef<
  | HTMLHeadingElement
  | HTMLQuoteElement
  | HTMLDivElement
  | HTMLLabelElement
  | HTMLParagraphElement,
  CopyProps
>(({ fontStyle = 'XS', className, children, tag = 'p' }, ref) => {
  const Element = tag

  return (
    <Element
      className={clsx(FontSizes[fontStyle], copy, className)}
      // @ts-expect-error – TODO: fix this
      ref={ref}
    >
      {children}
    </Element>
  )
})
