import { useRef } from 'react'
import { is, OneOrMore } from 'shared'

/** Use a value from the previous render */
export function usePrev<T>(value: T): T | undefined {
  const prevRef = useRef<any>(undefined)
  const prev = prevRef.current
  prevRef.current = value
  return prev
}

export function fillArray<T>(length: number, mapIndex: (index: number) => T) {
  const arr = []
  for (let i = 0; i < length; i++) arr.push(mapIndex(i))
  return arr
}

export function withDefault<T, DT>(value: T, defaultValue: DT) {
  return value == null ? defaultValue : value!
}

export function toArray<T>(a?: OneOrMore<T>): T[] {
  return is.und(a) ? [] : Array.isArray(a) ? a : [a]
}

export function callProp<T>(
  obj: T,
  ...args: any[]
): T extends (...args: any[]) => infer R ? R : T {
  return is.fun(obj) ? obj(...args) : obj
}

type PartialExcludedProps = Partial<{
  to: any
  from: any
  config: any
  onStart: any
  onRest: any
  onFrame: any
  children: any
  cancel: any
  reset: any
  reverse: any
  force: any
  immediate: any
  delay: any
  attach: any
  destroyed: any
  interpolateTo: any
  ref: any
  lazy: any
}> &
  object

export type ForwardedProps<T> = Pick<
  T,
  Exclude<keyof T, keyof PartialExcludedProps>
>

function getForwardProps<P extends PartialExcludedProps>(
  props: P
): ForwardedProps<P> {
  const {
    to,
    from,
    config,
    onStart,
    onRest,
    onFrame,
    children,
    cancel,
    reset,
    reverse,
    force,
    immediate,
    delay,
    attach,
    destroyed,
    interpolateTo,
    ref,
    lazy,
    ...forward
  } = props
  return forward
}

interface InterpolateTo<T> extends PartialExcludedProps {
  to: ForwardedProps<T>
}
export function interpolateTo<T extends PartialExcludedProps>(
  props: T
): InterpolateTo<T> {
  const forward = getForwardProps(props)
  props = Object.entries(props).reduce(
    (props, [key, value]) => (key in forward || (props[key] = value), props),
    {} as any
  )
  return { to: forward, ...props }
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
