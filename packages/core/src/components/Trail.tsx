import { ReactNode } from 'react'
import { NoInfer, is, Falsy } from '@react-spring/shared'

import { Valid } from '../types/common'
import { PickAnimated, SpringValues } from '../types'
import { UseSpringProps } from '../hooks/useSpring'
import { useTrail } from '../hooks/useTrail'

export type TrailComponentProps<Item, Props extends object = any> = unknown &
  UseSpringProps<Props> & {
    items: readonly Item[]
    children: (
      item: NoInfer<Item>,
      index: number
    ) => ((values: SpringValues<PickAnimated<Props>>) => ReactNode) | Falsy
  }

export function Trail<Item, Props extends TrailComponentProps<Item>>({
  items,
  children,
  ...props
}: Props & Valid<Props, TrailComponentProps<Item, Props>>) {
  const trails: any[] = useTrail(items.length, props)
  return items.map((item, index) => {
    const result = children(item, index)
    return is.fun(result) ? result(trails[index]) : result
  })
}
