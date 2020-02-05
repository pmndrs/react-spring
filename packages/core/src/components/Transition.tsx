import React from 'react'
import { NoInfer, OneOrMore } from 'shared'

import { PickAnimated, Valid } from '../types/common'
import {
  UseTransitionProps,
  useTransition,
  TransitionFn,
  ItemKeys,
} from '../hooks/useTransition'

export type TransitionRenderProp<
  Item = any,
  State extends object = any
> = Parameters<TransitionFn<Item, State>>[0]

export type TransitionComponentProps<
  Item,
  Props extends object = any
> = unknown &
  UseTransitionProps<Item> & {
    keys?: ItemKeys<NoInfer<Item>>
    items: OneOrMore<Item>
    children: TransitionRenderProp<NoInfer<Item>, PickAnimated<Props>>
  }

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
