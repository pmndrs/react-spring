import { ReactNode } from 'react'
import { UseSpringProps, UseSpringBaseProps } from './useSpring'
import { TransitionPhase, SpringValues, Merge, PickAnimated } from './common'
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
      children: (item: Item) => (props: SpringValues<Props>) => ReactNode
    }
  >
) => JSX.Element

export const Transition: <Item, Props extends object>(
  props: Merge<
    Props,
    UseTransitionProps<Item> & {
      items: ItemsProp<Item>
      children: (
        item: Item,
        phase: TransitionPhase,
        index: number
      ) => (props: SpringValues<Props>) => ReactNode
      keys?: ItemKeys<Item>
    }
  >
) => JSX.Element
