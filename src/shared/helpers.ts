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

type PartialExcludedProps = Partial<{ 
  to: any, 
  from: any, 
  config: any, 
  onStart: any, 
  onRest: any, 
  onFrame: any, 
  children: any, 
  reset: any, 
  reverse: any, 
  force: any, 
  immediate: any,
  delay: any,
  attach: any,
  destroyed: any,
  interpolateTo: any,
  ref: any,
  lazy: any
}> & object;

export type ForwardedProps<T> = Pick<T, Exclude<keyof T, keyof PartialExcludedProps>>

function getForwardProps<P extends PartialExcludedProps>(props: P): ForwardedProps<P> {
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
export function interpolateTo<T extends PartialExcludedProps>(props: T): InterpolateTo<T> {
  const forward: ForwardedProps<T> = getForwardProps(props)
  if (is.und(forward)) return { to: forward, ...props }
  const rest = Object.keys(props).reduce<PartialExcludedProps>(
    (a: PartialExcludedProps, k: string) => (!is.und((forward as any)[k]) ? a : { ...a, [k]: (props as any)[k] }),
    {}
  )
  return { to: forward, ...rest }
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
