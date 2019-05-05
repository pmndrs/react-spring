import { ReactNode } from 'react'
import { SpringValues } from './animated'
import { UseSpringProps, UseSpringBaseProps } from './useSpring'
import { TransitionPhase, Merge, PickAnimated } from './common'
import { UseTransitionProps, ItemsProp, ItemKeys } from './useTransition'

export const Spring: <Props extends object>(
  props: UseSpringProps<Props> & {
    children: (props: SpringValues<Props>) => ReactNode
  }
) => JSX.Element

export const Trail: <Item, Props extends object>(
  props: Merge<
    UseSpringProps<Props>,
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
