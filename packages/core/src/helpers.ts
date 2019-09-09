import { is, Merge, each } from 'shared'
import { ReservedProps, ForwardProps } from './types/common'

declare const process:
  | { env: { [key: string]: string | undefined } }
  | undefined

export function fillArray<T>(length: number, mapIndex: (index: number) => T) {
  const arr = []
  for (let i = 0; i < length; i++) arr.push(mapIndex(i))
  return arr
}

export function withDefault<T, DT>(value: T, defaultValue: DT) {
  return value == null ? defaultValue : value!
}

type AnyFn<In extends ReadonlyArray<any> = any[], Out = any> = (
  ...args: In
) => Out

export function callProp<T>(
  value: T,
  ...args: Parameters<Extract<T, AnyFn>>
): T extends AnyFn<any[], infer U> ? U : T {
  return is.fun(value) ? value(...args) : value
}

/**
 * Extract any properties whose keys are *not* reserved for customizing your
 * animations. All hooks use this function, which means `useTransition` props
 * are reserved for `useSpring` calls, etc.
 */
function getForwardProps<Props extends ReservedProps>(
  props: Props
): ForwardProps<Props> {
  const {
    children,
    config,
    from,
    to,
    ref,
    reset,
    cancel,
    reverse,
    immediate,
    delay,
    lazy,
    items,
    trail,
    unique,
    initial,
    enter,
    leave,
    update,
    onAnimate,
    onStart,
    onRest,
    onFrame,
    onDestroyed,
    timestamp,
    attach,
    ...forward
  } = props
  return forward
}

export type InterpolateTo<T extends object> = Merge<
  { to: ForwardProps<T> },
  Pick<T, keyof T & keyof ReservedProps>
>

export function interpolateTo<T extends object>(props: T): InterpolateTo<T> {
  const to = getForwardProps(props)
  const out: any = { to }
  each(props, (val, key) => key in to || (out[key] = val))
  return out
}

type ItemKey = number | string

interface Item {
  key: ItemKey
  originalKey: ItemKey
  phase: string
  item: any
  props: object
  destroyed?: boolean
}

interface DeletedItem extends Item {
  left?: ItemKey
  right?: ItemKey
}

/**
 * This tries to put deleted items back into the given `out` list in correct
 * order. Deleted items must have a `left` and `right` property with key of
 * their sibling which is used to find the correct placement.
 */
export function reconcileDeleted(
  deleted: DeletedItem[],
  current: Item[]
): any[] {
  // Copy as we will be mutating the arrays
  deleted = [...deleted]
  current = [...current]

  // Used to detect deadlock (when a pass finds 0 siblings)
  let failedTries = 0

  // Track where the current pass start/ends
  let passIndex = 0
  let nextPassIndex = deleted.length

  // Insert all deleted items into `current`
  for (let i = 0; i < deleted.length; i++) {
    if (i === nextPassIndex) {
      // Sanity test: Push to end if somehow no siblings were found
      if (passIndex + failedTries === nextPassIndex) {
        for (let j = i; j < deleted.length; j++) {
          const { left, right, ...deletedItem } = deleted[j]
          current.push(deletedItem)
        }
        break
      }
      // Update local state at the end of each pass
      passIndex = nextPassIndex
      nextPassIndex = deleted.length
      failedTries = 0
    }

    // The index of the deleted item in `current`
    let index = -1

    // Look for the left or right sibling in `current`
    const { left, right, ...deletedItem } = deleted[i]
    for (let j = current.length; --j >= 0; ) {
      const { originalKey: key } = current[j]
      if (key === right) {
        index = j
        break
      }
      if (key === left) {
        index = j + 1
        break
      }
    }

    // Items with no index are revisited in the next pass
    if (index < 0) {
      failedTries++
      deleted.push(deleted[i])
    } else {
      current.splice(index, 0, deletedItem)
    }
  }

  return current
}

export function freeze<T extends object>(obj: T): T {
  if (
    typeof process !== 'undefined' &&
    process.env.NODE_ENV === 'development'
  ) {
    return Object.freeze(obj)
  }
  return obj
}
