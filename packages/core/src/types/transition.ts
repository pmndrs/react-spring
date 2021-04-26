import { ReactNode } from 'react'
import {
  Lookup,
  ObjectFromUnion,
  ObjectType,
  Constrain,
  OneOrMore,
  UnknownProps,
  Merge,
  Falsy,
  NoInfer,
} from '@react-spring/types'

import {
  AnimationProps,
  ControllerProps,
  ControllerUpdate,
  ForwardProps,
  GoalProp,
  PickAnimated,
  SpringChain,
} from './props'
import { SpringToFn } from './functions'
import { SpringValues, SpringConfig } from './objects'
import { TransitionPhase } from '../TransitionPhase'
import { Controller } from '../Controller'
import { SpringRef } from '../SpringRef'

/** The phases of a `useTransition` item */
export type TransitionKey = 'initial' | 'enter' | 'update' | 'leave'

/**
 * Extract a union of animated values from a set of `useTransition` props.
 */
export type TransitionValues<Props extends object> = unknown &
  ForwardProps<
    ObjectFromUnion<
      Constrain<
        ObjectType<
          Props[TransitionKey & keyof Props] extends infer T
            ? T extends ReadonlyArray<infer Element>
              ? Element
              : T extends (...args: any[]) => infer Return
              ? Return extends ReadonlyArray<infer ReturnElement>
                ? ReturnElement
                : Return
              : T
            : never
        >,
        {}
      >
    >
  >

export type UseTransitionProps<Item = any> = Merge<
  Omit<ControllerProps<UnknownProps, Item>, 'onResolve'>,
  {
    from?: TransitionFrom<Item>
    initial?: TransitionFrom<Item>
    enter?: TransitionTo<Item>
    update?: TransitionTo<Item>
    leave?: TransitionTo<Item>
    keys?: ItemKeys<Item>
    sort?: (a: Item, b: Item) => number
    trail?: number
    /**
     * When `true` or `<= 0`, each item is unmounted immediately after its
     * `leave` animation is finished.
     *
     * When `false`, items are never unmounted.
     *
     * When `> 0`, this prop is used in a `setTimeout` call that forces a
     * rerender if the component that called `useTransition` doesn't rerender
     * on its own after an item's `leave` animation is finished.
     */
    expires?: boolean | number | ((item: Item) => boolean | number)
    config?:
      | SpringConfig
      | ((
          item: Item,
          index: number,
          state: TransitionPhase
        ) => AnimationProps['config'])
    /**
     * Called after a transition item is unmounted.
     */
    onDestroyed?: (item: Item, key: Key) => void
    /**
     * Used to access the imperative API.
     *
     * Animations never auto-start when `ref` is defined.
     */
    ref?: SpringRef
  }
>

export type TransitionComponentProps<
  Item,
  Props extends object = any
> = unknown &
  UseTransitionProps<Item> & {
    keys?: ItemKeys<NoInfer<Item>>
    items: OneOrMore<Item>
    children: TransitionRenderFn<NoInfer<Item>, PickAnimated<Props>>
  }

type Key = string | number

export type ItemKeys<T = any> = OneOrMore<Key> | ((item: T) => Key) | null

/** The function returned by `useTransition` */
export interface TransitionFn<Item = any, State extends Lookup = Lookup> {
  (render: TransitionRenderFn<Item, State>): JSX.Element
}

export interface TransitionRenderFn<Item = any, State extends Lookup = Lookup> {
  (
    values: SpringValues<State>,
    item: Item,
    transition: TransitionState<Item, State>,
    index: number
  ): ReactNode
}

export interface TransitionState<Item = any, State extends Lookup = Lookup> {
  key: any
  item: Item
  ctrl: Controller<State>
  phase: TransitionPhase
  expired?: boolean
  expirationId?: number
}

export type TransitionFrom<Item> =
  | Falsy
  | GoalProp<UnknownProps>
  | ((item: Item, index: number) => GoalProp<UnknownProps> | Falsy)

export type TransitionTo<Item, State extends Lookup = Lookup> =
  | Falsy
  | OneOrMore<ControllerUpdate<State, Item>>
  | Function // HACK: Fix inference of untyped inline functions.
  | ((
      item: Item,
      index: number
    ) =>
      | ControllerUpdate<State, Item>
      | SpringChain<State>
      | SpringToFn<State>
      | Falsy)

export interface Change {
  phase: TransitionPhase
  springs: SpringValues<UnknownProps>
  payload: ControllerUpdate
}
