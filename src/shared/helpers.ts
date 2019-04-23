import { MutableRefObject, Ref, useCallback, useState } from 'react'

export type NarrowObject<T> = unknown extends T
  ? T & { [key: string]: any }
  : Exclude<Extract<T, object>, Function | ReadonlyArray<any>>

export const is = {
  arr: Array.isArray,
  obj: <T>(a: T): a is NarrowObject<T> =>
    Object.prototype.toString.call(a) === '[object Object]',
  fun: (a: unknown): a is Function => typeof a === 'function',
  str: (a: unknown): a is string => typeof a === 'string',
  num: (a: unknown): a is number => typeof a === 'number',
  und: (a: unknown): a is undefined => a === void 0,
  nul: (a: unknown): a is null => a === null,
  boo: (a: unknown): a is boolean => typeof a === 'boolean',
  set: (a: unknown): a is Set<any> => a instanceof Set,
  map: (a: unknown): a is Map<any, any> => a instanceof Map,
  equ(a: any, b: any) {
    if (typeof a !== typeof b) return false
    if (is.str(a) || is.num(a)) return a === b
    if (
      is.obj(a) &&
      is.obj(b) &&
      Object.keys(a).length + Object.keys(b).length === 0
    )
      return true
    let i
    for (i in a) if (!(i in b)) return false
    for (i in b) if (a[i] !== b[i]) return false
    return is.und(i) ? a === b : true
  },
}

export function useForceUpdate() {
  const [, f] = useState(false)
  const forceUpdate = useCallback(() => f(v => !v), [])
  return forceUpdate
}

export function withDefault<T, DT>(value: T, defaultValue: DT) {
  return is.und(value) || is.nul(value) ? defaultValue : value!
}

export function toArray<T>(a?: T | T[]): T[] {
  return !is.und(a) ? (is.arr(a) ? a : [a]) : []
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

export function handleRef<T>(ref: T, forward: Ref<T>) {
  if (forward) {
    // If it's a function, assume it's a ref callback
    if (is.fun(forward)) forward(ref)
    else if (is.obj(forward)) {
      // If it's an object and has a 'current' property, assume it's a ref object
      ;(forward as MutableRefObject<T>).current = ref
    }
  }
  return ref
}

export function fillArray<T>(length: number, mapIndex: (index: number) => T) {
  const arr = []
  for (let i = 0; i < length; i++) arr.push(mapIndex(i))
  return arr
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
