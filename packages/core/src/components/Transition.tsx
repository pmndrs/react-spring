import * as React from 'react'

import { Valid } from '../types/common'
import { TransitionComponentProps } from '../types'
import { useTransition } from '../hooks'

export function Transition<
  Item extends any,
  Props extends TransitionComponentProps<Item>
>({
  items,
  children,
  ...props
}:
  | TransitionComponentProps<Item>
  | (Props & Valid<Props, TransitionComponentProps<Item, Props>>)) {
  return <>{useTransition(items, props)(children)}</>
}
