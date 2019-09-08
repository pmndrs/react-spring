import { ReactNode } from 'react'
import { UseTransitionProps, ItemsProp, ItemKeys } from './useTransition'
import { TransitionPhase, Merge, NoInfer } from './types/common'
import { SpringValues, RangeProps } from './types/spring'
import { AnimationProps } from './types/animated'
import { UseSpringProps } from './useSpring'

export declare const Spring: <Props extends object>(
  props: RangeProps<Props> &
    AnimationProps<NoInfer<Props>> & {
      children: (props: SpringValues<NoInfer<Props>>) => ReactNode
    }
) => JSX.Element

export declare const Trail: <Item, Props extends object>(
  props: Merge<
    Props & UseSpringProps<Props>,
    {
      items: readonly Item[]
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

export declare const Transition: <Item, Props extends object>(
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
