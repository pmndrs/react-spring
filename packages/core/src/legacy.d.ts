import { ReactNode } from 'react'
import { UseTransitionProps, ItemKeys } from './useTransition'
import {
  TransitionPhase,
  NoInfer,
  OneOrMore,
  Valid,
  Falsy,
  PickAnimated,
} from './types/common'
import { SpringValues } from './types/spring'
import { UseSpringProps } from './useSpring'

//
// <Spring/>
//

type SpringComponentProps<Props extends object = any> = unknown &
  UseSpringProps<Props> & {
    children: (values: SpringValues<PickAnimated<Props>>) => ReactNode
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
    ) => ((values: SpringValues<PickAnimated<Props>>) => ReactNode) | Falsy
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
    ) => ((values: SpringValues<PickAnimated<Props>>) => ReactNode) | Falsy
  }

export declare const Transition: <Item, Props extends object>(
  props:
    | (Props & Valid<Props, TransitionComponentProps<Item, Props>>)
    | TransitionComponentProps<Item>
) => JSX.Element
