import { useMemoOne } from 'use-memo-one'
import {
  is,
  each,
  toArray,
  getFluidConfig,
  isAnimatedString,
  AnyFn,
  OneOrMore,
  FluidValue,
} from 'shared'
import * as G from 'shared/globals'
import { ReservedProps, ForwardProps, InferTo } from './types'

// @see https://github.com/alexreardon/use-memo-one/pull/10
export const useMemo: typeof useMemoOne = (create, deps) =>
  useMemoOne(create, deps || [{}])

export function callProp<T>(
  value: T,
  ...args: T extends AnyFn ? Parameters<T> : unknown[]
): T extends AnyFn<any, infer U> ? U : T {
  return is.fun(value) ? value(...args) : value
}

/** Try to coerce the given value into a boolean using the given key */
export const matchProp = (
  value: boolean | OneOrMore<string> | ((key: any) => boolean) | undefined,
  key: string | undefined
) =>
  value === true ||
  !!(
    key &&
    value &&
    (is.fun(value) ? value(key) : toArray(value).includes(key))
  )

export const concatFn = <T extends AnyFn>(first: T | undefined, last: T) =>
  first ? (...args: Parameters<T>) => (first(...args), last(...args)) : last

type AnyProps<T, Arg = never> = OneOrMore<T> | ((i: number, arg: Arg) => T)

export const getProps = <T, Arg = never>(
  props: AnyProps<T, Arg> | null | undefined,
  i: number,
  arg: Arg
) =>
  props &&
  (is.fun(props) ? props(i, arg) : is.arr(props) ? props[i] : { ...props })

/** These props can have default values */
export const DEFAULT_PROPS = [
  'pause',
  'cancel',
  'config',
  'immediate',
  'onDelayEnd',
  'onProps',
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
  loop: 1,
  reset: 1,
  pause: 1,
  cancel: 1,
  reverse: 1,
  immediate: 1,
  default: 1,
  delay: 1,
  keys: 1,
  items: 1,
  trail: 1,
  sort: 1,
  expires: 1,
  initial: 1,
  enter: 1,
  leave: 1,
  update: 1,
  onDelayEnd: 1,
  onProps: 1,
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
): ForwardProps<Props> | undefined {
  const forward: any = {}

  let count = 0
  each(props, (value, prop) => {
    if (!RESERVED_PROPS[prop]) {
      forward[prop] = value
      count++
    }
  })

  if (count) {
    return forward
  }
}

/**
 * Clone the given `props` and move all non-reserved props
 * into the `to` prop.
 */
export function inferTo<T extends object>(props: T): InferTo<T> {
  const to = getForwardProps(props)
  if (to) {
    const out: any = { to }
    each(props, (val, key) => key in to || (out[key] = val))
    return out
  }
  return { ...props } as any
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
