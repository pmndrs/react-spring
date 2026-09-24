import {
  Falsy,
  Lookup,
  Merge,
  OneOrMore,
  UnknownProps,
} from '@react-spring/types'

import {
  AnimationProps,
  ControllerProps,
  ControllerUpdate,
  GoalProp,
  SpringChain,
} from './props'
import { SpringToFn } from './functions'
import { SpringValues } from './objects'
import { ItemKeys, TransitionFrom, TransitionTo } from './transition'
import { SpringRef } from '../SpringRef'

export type PresenceKey = string | number

/** The phase an entry is animating through */
export type PresencePhase = 'enter' | 'update' | 'leave'

/** What `usePresence` returns while its value is shown or leaving */
export interface Presence<State extends Lookup = Lookup> {
  springs: SpringValues<State>
  phase: PresencePhase
}

/** An item returned by `usePresenceList` */
export interface PresenceEntry<
  Item = any,
  State extends Lookup = Lookup,
> extends Presence<State> {
  key: PresenceKey
  item: Item
}

export type UsePresenceListProps<Item = any> = Merge<
  Omit<ControllerProps<UnknownProps, Item>, 'onResolve'>,
  {
    from?: TransitionFrom<Item>
    /**
     * Used instead of `from` for the items present on mount (and after a
     * `reset`). Use `null` to skip their `enter` animation.
     */
    initial?: TransitionFrom<Item>
    enter?: TransitionTo<Item>
    update?: TransitionTo<Item>
    leave?: TransitionTo<Item>
    keys?: ItemKeys<Item>
    sort?: (a: Item, b: Item) => number
    trail?: number
    /**
     * Reverses the order in which `trail` delays are assigned to changing
     * entries. Does not affect the order of entries, use `sort` for that.
     *
     * @default false
     */
    reverse?: boolean
    /**
     * With `'wait'`, new items are only added once every leaving entry has
     * finished its `leave` animation.
     *
     * @default 'sync'
     */
    mode?: 'sync' | 'wait'
    /**
     * When `false`, leaving entries are kept after their `leave` animation.
     *
     * With `keys: null`, a kept entry never gets its key back, so adding the
     * same item again adds a new entry every time.
     *
     * @default true
     */
    expires?: boolean
    /**
     * Passed to every spring, so a function is called with the spring's key.
     * For item- or phase-specific config, set `config` in `enter`, `update`
     * or `leave`.
     */
    config?: AnimationProps['config']
    /**
     * Passed to every spring, so a function is called with the spring's key.
     * The `trail` offset is added on top. For an item-specific delay, set
     * `delay` in `enter`, `update` or `leave`.
     */
    delay?: AnimationProps['delay']
    /**
     * Used to access the imperative API.
     *
     * Animations never auto-start when `ref` is defined, except items held
     * back by `mode: 'wait'`, which start once the leaving items finish.
     */
    ref?: SpringRef
  }
>

type PresenceFrom =
  | Falsy
  | GoalProp<UnknownProps>
  | (() => GoalProp<UnknownProps> | Falsy)

type PresenceTo<State extends Lookup = UnknownProps> =
  | Falsy
  | OneOrMore<ControllerUpdate<State, true>>
  | (() =>
      | ControllerUpdate<State, true>
      | SpringChain<State>
      | SpringToFn<State>
      | Falsy)

export type UsePresenceProps = Merge<
  Omit<
    UsePresenceListProps<true>,
    'keys' | 'sort' | 'trail' | 'reverse' | 'mode'
  >,
  {
    from?: PresenceFrom
    initial?: PresenceFrom
    enter?: PresenceTo
    update?: PresenceTo
    leave?: PresenceTo
  }
>
