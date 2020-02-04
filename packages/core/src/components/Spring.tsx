import { ReactNode } from 'react'

import { PickAnimated, Valid } from '../types/common'
import { SpringValues } from '../types/spring'
import { UseSpringProps, useSpring } from '../useSpring'

export type SpringComponentProps<Props extends object = any> = unknown &
  UseSpringProps<Props> & {
    children: (values: SpringValues<PickAnimated<Props>>) => ReactNode
  }

/**
 * The `Spring` component passes `SpringValue` objects to your render prop.
 */
export function Spring<Props extends SpringComponentProps>({
  children,
  ...props
}: Props & Valid<Props, SpringComponentProps<Props>>) {
  return children(useSpring(props))
}
