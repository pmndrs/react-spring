import { ReactNode } from 'react'
import { NoInfer, Falsy, UnknownProps } from 'shared'
import { Valid } from '../types/common'
import {
  PickAnimated,
  SpringValues,
  SpringToFn,
  SpringChain,
  TransitionComponentProps,
} from '../types'
import { UseSpringProps } from '../hooks/useSpring'

//
// <Spring>
//

export type SpringComponentProps<
  State extends object = UnknownProps
> = unknown &
  UseSpringProps<State> & {
    children: (values: SpringValues<State>) => JSX.Element | null
  }

// This overload infers `State` using the `from` object prop.
export function Spring<State extends object>(
  props: {
    from: State
    to?: SpringChain<NoInfer<State>> | SpringToFn<NoInfer<State>>
  } & Omit<SpringComponentProps<NoInfer<State>>, 'from' | 'to'>
): JSX.Element | null

// This overload infers `State` using the `to` object prop.
export function Spring<State extends object>(
  props: { to: State } & Omit<SpringComponentProps<NoInfer<State>>, 'to'>
): JSX.Element | null

//
// <Transition>
//

export function Transition<
  Item extends any,
  Props extends TransitionComponentProps<Item>
>({
  items,
  children,
  ...props
}:
  | TransitionComponentProps<Item>
  | (Props & Valid<Props, TransitionComponentProps<Item, Props>>)): JSX.Element

export type TrailComponentProps<Item, Props extends object = any> = unknown &
  UseSpringProps<Props> & {
    items: readonly Item[]
    children: (
      item: NoInfer<Item>,
      index: number
    ) => ((values: SpringValues<PickAnimated<Props>>) => ReactNode) | Falsy
  }

//
// <Trail>
//

export function Trail<Item, Props extends TrailComponentProps<Item>>({
  items,
  children,
  ...props
}: Props & Valid<Props, TrailComponentProps<Item, Props>>): JSX.Element
