import { ReactNode } from 'react'
import { UseTransitionProps, ItemKeys } from './useTransition'
import {
  TransitionPhase,
  Merge,
  NoInfer,
  OneOrMore,
  Valid,
  Falsy,
} from './types/common'
import { SpringValues, RangeProps } from './types/spring'
import { AnimationProps, AnimationEvents } from './types/animated'
import { UseSpringProps } from './useSpring'

//
// <Spring/>
//

type SpringComponentProps<Props extends object = any> = unknown &
  UseSpringProps<Props> & {
    children: (values: SpringValues<NoInfer<Props>>) => ReactNode
  }

/**
 * The `Spring` component passes `SpringValue` objects to your render prop.
 */
export declare const Spring: <Props extends object>(
  props:
    | (Props & Valid<Props, SpringComponentProps<Props>>)
    | SpringComponentProps
) => JSX.Element

//
// <Trail/>
//

type TrailComponentProps<Item, Props extends object = any> = unknown &
  UseSpringProps<Props> & {
    items: readonly Item[]
    children: (
      item: NoInfer<Item>,
      index: number
    ) => ((values: SpringValues<Props>) => ReactNode) | Falsy
  }

export declare const Trail: <Item, Props extends object>(
  props:
    | (Props & Valid<Props, TrailComponentProps<Item, Props>>)
    | TrailComponentProps<NoInfer<Item>>
) => JSX.Element

//
// <Transition/>
//

type TransitionComponentProps<Item, Props extends object = any> = unknown &
  UseTransitionProps<Item> & {
    keys?: ItemKeys<NoInfer<Item>>
    items: OneOrMore<Item>
    children: (
      item: NoInfer<Item>,
      phase: TransitionPhase,
      index: number
    ) => ((values: SpringValues<Props>) => ReactNode) | false | null | undefined
  }

export declare const Transition: <Item, Props extends object>(
  props:
    | (Props & Valid<Props, TransitionComponentProps<Item, Props>>)
    | TransitionComponentProps<Item>
) => JSX.Element
