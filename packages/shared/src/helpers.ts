import { useEffect, useLayoutEffect, useReducer, useRef } from 'react'
import { Indexable, Arrify } from './types'
import * as G from './globals'

export const noop = () => {}

export const defineHidden = (obj: any, key: any, value: any) =>
  Object.defineProperty(obj, key, { value, writable: true, configurable: true })

interface IsArray {
  <T>(a: T): a is T & readonly any[]
}

type PlainObject<T> = Exclude<T & Indexable, Function | readonly any[]>

export const is = {
  arr: Array.isArray as IsArray,
  obj: <T extends any>(a: T): a is PlainObject<T> =>
    !!a && a.constructor.name === 'Object',
  fun: (a: unknown): a is Function => typeof a === 'function',
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
  (value[0] == '#' ||
    /\d/.test(value) ||
    !!(G.colorNames && G.colorNames[value]))

interface EachFn {
  <T = any, This = any>(
    obj: ReadonlySet<T>,
    cb: (this: This, value: T) => void,
    ctx?: This
  ): void

  <P = any, T = any, This = any>(
    obj: ReadonlyMap<P, T>,
    cb: (this: This, value: T, key: P) => void,
    ctx?: This
  ): void

  <T = any, This = any>(
    arr: readonly T[],
    cb: (this: This, value: T, index: number) => void,
    ctx?: This
  ): void

  <T extends Indexable = any, This = any>(
    obj: T,
    cb: (this: This, value: T[keyof T], key: keyof T) => void,
    ctx?: This
  ): void
}

/** An unsafe object/array/set iterator that allows for better minification */
export const each: EachFn = (obj: Indexable, cb: any, ctx: any) => {
  if (is.fun(obj.forEach)) {
    obj.forEach(cb, ctx)
  } else {
    Object.keys(obj).forEach(key => cb.call(ctx, obj[key], key))
  }
}

export const toArray = <T>(a: T): Arrify<Exclude<T, void>> =>
  is.und(a) ? [] : is.arr(a) ? (a as any) : [a]

export const useOnce = (effect: React.EffectCallback) => useEffect(effect, [])

export const useForceUpdate = () => useReducer(() => ({}), 0)[1] as (() => void)

/** Use a value from the previous render */
export function usePrev<T>(value: T): T | undefined {
  const prevRef = useRef<any>(undefined)
  useEffect(() => {
    prevRef.current = value
  })
  return prevRef.current
}

declare const window: any

/**
 * React calls `console.warn` when using `useLayoutEffect` on the server.
 * To get around it, we can conditionally `useEffect` on the server (no-op) and
 * `useLayoutEffect` on the client.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' &&
  typeof window.document !== 'undefined' &&
  typeof window.document.createElement !== 'undefined'
    ? useLayoutEffect
    : useEffect
