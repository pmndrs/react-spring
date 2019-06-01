import { Indexable } from './types'
export * from './types'
export * from './createInterpolator'
import * as Globals from './globals'
export { Globals }
interface IsArray {
  <T>(a: T): a is T & ReadonlyArray<any>
}
export declare const is: {
  arr: IsArray
  obj: <T extends any>(
    a: T
  ) => a is Exclude<T & Indexable<any>, Function | readonly any[]>
  fun: (a: unknown) => a is Function
  str: (a: unknown) => a is string
  num: (a: unknown) => a is number
  und: (a: unknown) => a is undefined
  boo: (a: unknown) => a is boolean
}
export declare function useForceUpdate(): () => void
