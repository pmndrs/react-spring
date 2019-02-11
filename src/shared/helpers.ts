import { MutableRefObject, Ref, useCallback, useState } from 'react'

export const is = {
  arr: Array.isArray,
  obj: (a: unknown): a is object =>
    Object.prototype.toString.call(a) === '[object Object]',
  fun: (a: unknown): a is Function => typeof a === 'function',
  str: (a: unknown): a is string => typeof a === 'string',
  num: (a: unknown): a is number => typeof a === 'number',
  und: (a: unknown): a is undefined => a === void 0,
  nul: (a: unknown): a is null => a === null,
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
  return is.und(value) || is.nul(value) ? defaultValue : value
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

function getForwardProps(props: any) {
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

export function interpolateTo(props: any) {
  const forward = getForwardProps(props)
  const rest = Object.keys(props).reduce(
    (a, k) => (!is.und(forward[k]) ? a : { ...a, [k]: props[k] }),
    {}
  )
  return { to: forward, ...rest }
}

export function handleRef(ref: any, forward: Ref<any>) {
  if (forward) {
    // If it's a function, assume it's a ref callback
    if (is.fun(forward)) forward(ref)
    else if (is.obj(forward)) {
      // If it's an object and has a 'current' property, assume it's a ref object
      ;(forward as MutableRefObject<any>).current = ref
    }
  }
  return ref
}
