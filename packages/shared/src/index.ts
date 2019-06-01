import { useCallback, useState } from 'react'
import { Indexable } from './types'

export * from './types'
export * from './createInterpolator'

import * as Globals from './globals'
export { Globals }

interface IsArray {
  <T>(a: T): a is T & ReadonlyArray<any>
}

type PlainObject<T> = Exclude<T & Indexable, Function | ReadonlyArray<any>>

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

export function useForceUpdate() {
  const [, f] = useState(false)
  const forceUpdate = useCallback(() => f(v => !v), [])
  return forceUpdate
}
