import { useEffect, useReducer, useRef } from 'react'
import { Indexable, OneOrMore } from './types'

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
  und: (a: unknown): a is undefined => a === void 0,
  boo: (a: unknown): a is boolean => typeof a === 'boolean',
}

interface EachFn {
  <T = any, This = any>(
    obj: ReadonlySet<T>,
    cb: (this: This, value: T) => void,
    ctx?: This
  ): void

  <T = any, This = any>(
    arr: readonly T[],
    cb: (this: This, value: T, index: number) => void,
    ctx?: This
  ): void

  <T = any, This = any>(
    obj: Indexable<T>,
    cb: (this: This, value: T, key: string) => void,
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

export const toArray = <T>(a?: OneOrMore<T>): T[] =>
  is.und(a) ? [] : Array.isArray(a) ? a : [a]

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
