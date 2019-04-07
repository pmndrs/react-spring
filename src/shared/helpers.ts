import { MutableRefObject, Ref, useCallback, useState } from 'react'

export const is = {
  arr: Array.isArray,
  obj: (a: unknown): a is Object =>
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

export function merge(target: any, lowercase: boolean = true) {
  return (object: object) =>
    (is.arr(object) ? object : Object.keys(object)).reduce(
      (acc: any, element) => {
        const key = lowercase
          ? element[0].toLowerCase() + element.substring(1)
          : element
        acc[key] = target(key)
        return acc
      },
      target
    )
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

/**
 * This tries to put deleted items back into out list in correct order. Deleted
 * items need to have a left and right property with id of their sibling which
 * is used to find the correct placement.
 * @param deleted
 * @param out
 */
export function reconcileDeleted(
  deleted: { left?: number; right?: number }[],
  out: { originalKey: number }[]
): any[] {
  // Copy as we will be mutating the arrays
  deleted = [...deleted]
  let result: any[] = [...out]

  // Keep track of how many times we were not able to insert an item
  let failedTries = 0

  // Either try to insert all deleted items or bail if we went through whole
  // list and did not insert single item. Bailing means the chain was
  // interrupted somewhere and we cannot recreate the ordering.
  while (deleted.length && failedTries < deleted.length) {
    const d = deleted.shift()!
    let indexToInsert = null

    result.forEach((item, index) => {
      // try find a sibling in out array
      if (item.originalKey == d.left) {
        indexToInsert = index + 1
        return
      }

      if (item.originalKey == d.right) {
        indexToInsert = index
        return
      }
    })

    if (indexToInsert === null) {
      // we did not find where it should be inserted, probably the sibling is
      // in deleted array and we did not insert it yet so put it back on stack
      // and try later
      deleted.push(d)
      failedTries += 1
    } else {
      result.splice(Math.max(indexToInsert, 0), 0, d)
      indexToInsert = null
      failedTries = 0
    }
  }

  // We were not able to recreate the ordering just put them in the beginning.
  // We assume deleted item are already ordered properly. There are some
  // (not sure if bugs or not) cases where we get here, for example items without
  // siblings have left set to their own key so if items are added one by one
  // they won't be linked
  if (deleted.length) {
    result = [...deleted, ...result]
  }

  return result
}
