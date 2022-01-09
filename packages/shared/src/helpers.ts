import { Lookup, Arrify, AnyFn, Any } from '@react-spring/types'

export function noop() {}

export const defineHidden = (obj: any, key: any, value: any) =>
  Object.defineProperty(obj, key, { value, writable: true, configurable: true })

type IsType<U> = <T>(arg: T & any) => arg is Narrow<T, U>
type Narrow<T, U> = [T] extends [Any] ? U : [T] extends [U] ? Extract<T, U> : U

type PlainObject<T> = Exclude<T & Lookup, Function | readonly any[]>

export const is = {
  arr: Array.isArray as IsType<readonly any[]>,
  obj: <T extends any>(a: T & any): a is PlainObject<T> =>
    !!a && a.constructor.name === 'Object',
  fun: ((a: unknown) => typeof a === 'function') as IsType<Function>,
  str: (a: unknown): a is string => typeof a === 'string',
  num: (a: unknown): a is number => typeof a === 'number',
  und: (a: unknown): a is undefined => a === undefined,
}

/** Compare animatable values */
export function isEqual(a: any, b: any) {
  if (is.arr(a)) {
    if (!is.arr(b) || a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false
    }
    return true
  }
  return a === b
}

type EachFn<Value, Key, This> = (this: This, value: Value, key: Key) => void
type Eachable<Value = any, Key = any, This = any> = {
  forEach(cb: EachFn<Value, Key, This>, ctx?: This): void
}

/** Minifiable `.forEach` call */
export const each = <Value, Key, This>(
  obj: Eachable<Value, Key, This>,
  fn: EachFn<Value, Key, This>
) => obj.forEach(fn)

/** Iterate the properties of an object */
export function eachProp<T extends object, This>(
  obj: T,
  fn: (
    this: This,
    value: T extends any[] ? T[number] : T[keyof T],
    key: string
  ) => void,
  ctx?: This
) {
  if (is.arr(obj)) {
    for (let i = 0; i < obj.length; i++) {
      fn.call(ctx as any, obj[i] as any, `${i}`)
    }
    return
  }
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      fn.call(ctx as any, obj[key] as any, key)
    }
  }
}

export const toArray = <T>(a: T): Arrify<Exclude<T, void>> =>
  is.und(a) ? [] : is.arr(a) ? (a as any) : [a]

/** Copy the `queue`, then iterate it after the `queue` is cleared */
export function flush<P, T>(
  queue: Map<P, T>,
  iterator: (entry: [P, T]) => void
): void
export function flush<T>(queue: Set<T>, iterator: (value: T) => void): void
export function flush(queue: any, iterator: any) {
  if (queue.size) {
    const items = Array.from(queue)
    queue.clear()
    each(items, iterator)
  }
}

/** Call every function in the queue with the same arguments. */
export const flushCalls = <T extends AnyFn>(
  queue: Set<T>,
  ...args: Parameters<T>
) => flush(queue, fn => fn(...args))

// For server-side rendering: https://github.com/react-spring/zustand/pull/34
// Deno support: https://github.com/pmndrs/zustand/issues/347

export const isSSR = () =>
  typeof window === 'undefined' ||
  !window.navigator ||
  /ServerSideRendering|^Deno\//.test(window.navigator.userAgent)
