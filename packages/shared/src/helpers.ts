import { Lookup, Arrify, AnyFn, Any } from '@react-spring/types'
import * as G from './globals'

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

// Not all strings can be animated (eg: {display: "none"})
export const isAnimatedString = (value: unknown): value is string =>
  is.str(value) &&
  (value[0] == '#' || /\d/.test(value) || !!(G.colors && G.colors[value]))

type Eachable<Value, Key> = {
  forEach: (cb: (value: Value, key: Key) => void, ctx?: any) => void
}

type InferKey<T extends object> = T extends Eachable<any, infer Key>
  ? Key
  : Extract<keyof T, string>

type InferValue<T extends object> = T extends
  | Eachable<infer Value, any>
  | { [key: string]: infer Value }
  ? Value
  : never

/** An unsafe object/array/set iterator that allows for better minification */
export const each = <T extends object, This>(
  obj: T & { forEach?: Function },
  cb: (this: This, value: InferValue<T>, key: InferKey<T>) => void,
  ctx?: This
) => {
  if (is.fun(obj.forEach)) {
    obj.forEach(cb, ctx)
  } else {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      const key: any = keys[i]
      cb.call(ctx!, (obj as any)[key], key)
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
