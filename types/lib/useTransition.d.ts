import { SpringValues } from './animated'
import { SpringAsyncFn, SpringUpdate } from './useSpring'
import { UnknownProps, SpringConfig, Solve, TransitionPhase } from './common'

export type ItemsProp<T> = ReadonlyArray<T> | T | null | undefined
export type ItemKeys<T> =
  | ((item: T) => string | number)
  | ReadonlyArray<string | number>
  | string
  | number
  | null

/**
 * Animate a set of values whenever one changes.
 *
 * The returned array can be safely mutated.
 */
export function useTransition<
  Item,
  Props extends UnknownProps & UseTransitionProps<Item>
>(
  items: ItemsProp<Item>,
  keys: ItemKeys<Item>,
  props: Props
): ItemTransition<Item, Props>[]

/** The transition state of a single item */
export type ItemTransition<Item, Props extends object = {}> = Solve<{
  key: string | number
  item: Item
  phase: TransitionPhase
  props: SpringValues<Props>
}>

/** For props that provide animated keys */
type TransitionProp<Item> =
  | SpringUpdate
  | ReadonlyArray<SpringUpdate>
  | ((item: Item) => SpringUpdate | SpringAsyncFn)

export type UseTransitionProps<Item = any> = {
  /**
   * Base values (from -> enter), or: item => values
   * @default {}
   */
  from?: TransitionProp<Item>
  /**
   * Values that apply to new elements, or: item => values
   * @default {}
   */
  enter?: TransitionProp<Item>
  /**
   * Values that apply to leaving elements, or: item => values
   * @default {}
   */
  leave?: TransitionProp<Item>
  /**
   * Values that apply to elements that are neither entering nor leaving (you
   * can use this to update present elements), or: item => values
   */
  update?: TransitionProp<Item>
  /**
   * First-render initial values, if present overrides "from" on the first
   * render pass. It can be "null" to skip first mounting transition. Otherwise
   * it can take an object or a function (item => object)
   */
  initial?: TransitionProp<Item> | null
  /**
   * Configure the spring behavior for each item.
   */
  config?: SpringConfig | ((item: Item, phase: TransitionPhase) => SpringConfig)
  /**
   * The same keys you would normally hand over to React in a list.
   */
  keys?:
    | ((item: Item) => string | number)
    | ReadonlyArray<string | number>
    | string
    | number
  /**
   * When this and `unique` are both true, items in the "enter" phase start from
   * their values in the "from" prop instead of their current positions.
   */
  reset?: boolean
  /**
   * Milliseconds of delay before animating the next item.
   *
   * This applies to all transition phases.
   */
  trail?: number
  /**
   * When true, no two items can have the same key. Reuse any items that
   * re-enter before they finish leaving.
   */
  unique?: boolean
  /**
   * Called when an animation is about to start
   */
  onStart?: (item: Item, phase: TransitionPhase, animation: any) => void
  /**
   * Called when all animations come to a stand-still
   */
  onRest?: (
    item: Item,
    phase: TransitionPhase,
    restValues: UnknownProps
  ) => void
  /**
   * Called on every frame when animations are active
   */
  onFrame?: (
    item: Item,
    phase: TransitionPhase,
    currentValues: UnknownProps
  ) => void
  /**
   * Called after an object has finished its "leave" transition
   */
  onDestroyed?: (item: Item) => void
}
