import { useEffect, useRef, useState } from 'react'
import { Lookup, Arrify } from './types.util'
import * as G from './globals'

export const noop = () => {}

export const defineHidden = (obj: any, key: any, value: any) =>
  Object.defineProperty(obj, key, { value, writable: true, configurable: true })

interface IsArray {
  <T>(a: T): a is T & readonly any[]
}

type PlainObject<T> = Exclude<T & Lookup, Function | readonly any[]>

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
    Object.keys(obj).forEach(key =>
      cb.call(ctx!, (obj as any)[key], key as any)
    )
  }
}

export const toArray = <T>(a: T): Arrify<Exclude<T, void>> =>
  is.und(a) ? [] : is.arr(a) ? (a as any) : [a]

// Explicit type annotation fixes TS2742 error.
type UseOnce = (effect: React.EffectCallback) => void

export const useOnce: UseOnce = effect => useEffect(effect, [])

/** Return a function that re-renders this component, if still mounted */
export const useForceUpdate = () => {
  const update = useState<any>(0)[1]
  const unmounted = useRef(false)
  useOnce(() => () => {
    unmounted.current = true
  })
  return () => {
    if (!unmounted.current) {
      update({})
    }
  }
}

/** Use a value from the previous render */
export function usePrev<T>(value: T): T | undefined {
  const prevRef = useRef<any>(undefined)
  useEffect(() => {
    prevRef.current = value
  })
  return prevRef.current
}
