import { useEffect, useReducer, useRef } from 'react'
import { Indexable } from './types'

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

export function useOnce(effect: React.EffectCallback) {
  useEffect(effect, [])
}

export const useForceUpdate = () =>
  useReducer(() => ({}), {})[1] as (() => void)

/** Use a value from the previous render */
export function usePrev<T>(value: T): T | undefined {
  const prevRef = useRef<any>(undefined)
  const prev = prevRef.current
  prevRef.current = value
  return prev
}
