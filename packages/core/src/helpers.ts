import { useMemoOne } from 'use-memo-one'
import {
  is,
  each,
  toArray,
  getFluidConfig,
  isAnimatedString,
  AnyFn,
  Merge,
  OneOrMore,
  FluidValue,
} from 'shared'
import * as G from 'shared/globals'

import { ReservedProps, ForwardProps } from './types/common'

declare const process:
  | { env: { [key: string]: string | undefined } }
  | undefined

// @see https://github.com/alexreardon/use-memo-one/pull/10
export const useMemo: typeof useMemoOne = (create, deps) =>
  useMemoOne(create, deps || [{}])

export function callProp<T>(
  value: T,
  ...args: AnyFn extends T ? Parameters<Extract<T, AnyFn>> : unknown[]
): T extends AnyFn<any, infer U> ? U : T {
  return is.fun(value) ? value(...args) : value
}

export type MatchProp<P extends string = string> =
  | boolean
  | OneOrMore<P>
  | ((key: P) => boolean)

/** Try to coerce the given value into a boolean using the given key */
export const matchProp = <P extends string = string>(
  value: MatchProp<P> | undefined,
  key: P | undefined
) =>
  value === true ||
  !!(
    key &&
    value &&
    (is.fun(value) ? value(key) : toArray(value).includes(key))
  )

type AnyProps<T, Arg = never> = OneOrMore<T> | ((i: number, arg: Arg) => T)

export const getProps = <T, Arg = never>(
  props: AnyProps<T, Arg>,
  i: number,
  arg: Arg
) => (is.fun(props) ? props(i, arg) : is.arr(props) ? props[i] : { ...props })

/** These props can have default values */
export const DEFAULT_PROPS = [
  'config',
  'immediate',
  'onAnimate',
  'onStart',
  'onChange',
  'onRest',
] as const

const RESERVED_PROPS: Required<ReservedProps> = {
  children: 1,
  config: 1,
  from: 1,
  to: 1,
  ref: 1,
  reset: 1,
  cancel: 1,
  reverse: 1,
  immediate: 1,
  default: 1,
  delay: 1,
  lazy: 1,
  items: 1,
  trail: 1,
  sort: 1,
  expires: 1,
  initial: 1,
  enter: 1,
  leave: 1,
  update: 1,
  onAnimate: 1,
  onStart: 1,
  onChange: 1,
  onRest: 1,
}

/**
 * Extract any properties whose keys are *not* reserved for customizing your
 * animations. All hooks use this function, which means `useTransition` props
 * are reserved for `useSpring` calls, etc.
 */
function getForwardProps<Props extends ReservedProps>(
  props: Props
): ForwardProps<Props> {
  const forward: any = {}
  each(props, (value, prop) => {
    if (!RESERVED_PROPS[prop as keyof ReservedProps]) {
      forward[prop] = value
    }
  })
  return forward
}

export type InterpolateTo<T extends object> = Merge<
  { to: ForwardProps<T> },
  Pick<T, keyof T & keyof ReservedProps>
>

export function interpolateTo<T extends object>(props: T): InterpolateTo<T> {
  const to = getForwardProps(props)
  const out: any = { to }
  each(props, (val, key) => key in to || (out[key] = val))
  return out
}

export function freeze<T extends object>(obj: T): T {
  if (
    typeof process !== 'undefined' &&
    process.env.NODE_ENV === 'development'
  ) {
    return Object.freeze(obj)
  }
  return obj
}

// Compute the goal value, converting "red" to "rgba(255, 0, 0, 1)" in the process
export function computeGoal<T>(value: T | FluidValue<T>): T {
  const config = getFluidConfig(value)
  return config
    ? computeGoal(config.get())
    : is.arr(value)
    ? value.map(computeGoal)
    : isAnimatedString(value)
    ? (G.createStringInterpolator({
        range: [0, 1],
        output: [value, value] as any,
      })(1) as any)
    : value
}
