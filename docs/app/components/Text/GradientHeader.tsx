import clsx from 'clsx'
import { Heading, HeadingProps } from './Heading'

import { gradientHeader } from './GradientHeader.css'

const GradientHeader = ({ className, ...restProps }: HeadingProps) => {
  return <Heading className={clsx(gradientHeader, className)} {...restProps} />
}

export { GradientHeader }
