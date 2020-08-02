import { ReactNode } from 'react'
import {
  Lookup,
  ObjectFromUnion,
  ObjectType,
  Constrain,
  OneOrMore,
  UnknownProps,
  RefProp,
  Merge,
  Falsy,
  NoInfer,
} from '@react-spring/shared'

import {
  AnimationProps,
  ControllerProps,
  ControllerUpdate,
  ForwardProps,
  GoalProp,
  PickAnimated,
  SpringChain,
  SpringDefaultProps,
} from './props'
import { SpringToFn } from './functions'
import { SpringValues, SpringConfig } from './objects'
import { TransitionPhase } from '../TransitionPhase'
import { AnimationResult } from '../AnimationResult'
import { SpringHandle } from '../SpringHandle'
import { Controller } from '../Controller'

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
  ControllerProps<UnknownProps>,
  {
    from?: TransitionFrom<Item>
    initial?: TransitionFrom<Item>
    enter?: TransitionTo<Item>
    update?: TransitionTo<Item>
    leave?: TransitionTo<Item>
    key?: ItemKeys<Item>
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
      | ((item: Item, index: number) => AnimationProps['config'])
    onRest?: (
      result: AnimationResult<UnknownProps>,
      transition: TransitionState
    ) => void
    /**
     * Used to access the imperative API.
     *
     * Animations never auto-start when `ref` is defined.
     */
    ref?: RefProp<SpringHandle>
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

/** Default props for a `useTransition` call */
export type TransitionDefaultProps<Item = any> = Pick<
  UseTransitionProps<Item>,
  keyof SpringDefaultProps
>

type Key = string | number

export type ItemKeys<T = any> = OneOrMore<Key> | ((item: T) => Key) | null

/** The function returned by `useTransition` */
export interface TransitionFn<Item = any, State extends object = any> {
  (render: TransitionRenderFn<Item, State>): JSX.Element
}

export interface TransitionRenderFn<Item = any, State extends object = any> {
  (
    values: SpringValues<State>,
    item: Item,
    transition: TransitionState<Item, State>,
    index: number
  ): ReactNode
}

export interface TransitionState<Item = any, State extends object = any> {
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
  | OneOrMore<ControllerUpdate<State>>
  | Function // HACK: Fix inference of untyped inline functions.
  | ((
      item: Item,
      index: number
    ) =>
      | ControllerUpdate<State>
      | SpringChain<State>
      | SpringToFn<State>
      | Falsy)

export interface Change {
  phase: TransitionPhase
  springs: SpringValues<UnknownProps>
  payload: ControllerUpdate
}
