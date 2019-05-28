import { ReactNode } from 'react'
import { SpringValues } from './animated'
import { TransitionPhase, Merge } from './common'
import { UseTransitionProps, ItemsProp, ItemKeys } from './useTransition'
import { UseSpringProps } from './useSpring'

export const Spring: <Props extends object>(
  props: Props &
    UseSpringProps<Props> & {
      children: (props: SpringValues<Props>) => ReactNode
    }
) => JSX.Element

export const Trail: <Item, Props extends object>(
  props: Merge<
    Props & UseSpringProps<Props>,
    {
      items: ReadonlyArray<Item>
      children: (
        item: Item,
        index: number
      ) =>
        | ((props: SpringValues<Props>) => ReactNode)
        | false
        | null
        | undefined
    }
  >
) => JSX.Element

export const Transition: <Item, Props extends object>(
  props: Merge<
    Props,
    UseTransitionProps<Item> & {
      keys?: ItemKeys<Item>
      items: ItemsProp<Item>
      children: (
        item: Item,
        phase: TransitionPhase,
        index: number
      ) =>
        | ((props: SpringValues<Props>) => ReactNode)
        | false
        | null
        | undefined
    }
  >
) => JSX.Element
