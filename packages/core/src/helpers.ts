import { useMemoOne } from 'use-memo-one'
import {
  is,
  each,
  toArray,
  getFluidConfig,
  isAnimatedString,
  FluidValue,
  Globals as G,
} from '@react-spring/shared'
import { AnyFn, OneOrMore, Lookup, Falsy } from '@react-spring/types'
import { ReservedProps, ForwardProps, InferTo } from './types'
import type { Controller } from './Controller'
import type { SpringRef } from './SpringRef'

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

/** Returns `true` if the given prop is having its default value set. */
export const hasDefaultProp = <T extends Lookup>(props: T, key: keyof T) =>
  !is.und(getDefaultProp(props, key))

/** Get the default value being set for the given `key` */
export const getDefaultProp = <T extends Lookup, P extends keyof T>(
  props: T,
  key: P
): T[P] =>
  props.default === true
    ? props[key]
    : props.default
    ? props.default[key]
    : undefined

/**
 * Extract the default props from an update.
 *
 * When the `default` prop is falsy, this function still behaves as if
 * `default: true` was used. The `default` prop is always respected when
 * truthy.
 */
export const getDefaultProps = <T extends Lookup>(
  props: Lookup,
  omitKeys: readonly (string | Falsy)[] = [],
  defaults: Lookup = {} as any
) => {
  let keys: readonly string[] = DEFAULT_PROPS
  if (props.default && props.default !== true) {
    props = props.default
    keys = Object.keys(props)
  }
  for (const key of keys) {
    const value = props[key]
    if (!is.und(value) && !omitKeys.includes(key)) {
      defaults[key] = value
    }
  }
  return defaults as T
}

/** Merge the default props of an update into a props cache. */
export const mergeDefaultProps = (
  defaults: Lookup,
  props: Lookup,
  omitKeys?: readonly (string | Falsy)[]
) => getDefaultProps(props, omitKeys, defaults)

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
  'onPause',
  'onResume',
  'onRest',
] as const

const RESERVED_PROPS: Required<ReservedProps> = {
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
  onDelayEnd: 1,
  onProps: 1,
  onStart: 1,
  onChange: 1,
  onPause: 1,
  onResume: 1,
  onRest: 1,

  // Transition props
  items: 1,
  trail: 1,
  sort: 1,
  expires: 1,
  initial: 1,
  enter: 1,
  update: 1,
  leave: 1,
  children: 1,

  // Internal props
  keys: 1,
  callId: 1,
  parentId: 1,
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

export function hasProps(props: object) {
  for (const _ in props) return true
  return false
}

export function isAsyncTo(to: any) {
  return is.fun(to) || (is.arr(to) && is.obj(to[0]))
}

/** Detach `ctrl` from `ctrl.ref` and (optionally) the given `ref` */
export function detachRefs(ctrl: Controller, ref?: SpringRef) {
  ctrl.ref?.current.delete(ctrl)
  ref?.current.delete(ctrl)
}

/** Replace `ctrl.ref` with the given `ref` (if defined) */
export function replaceRef(ctrl: Controller, ref?: SpringRef) {
  if (ref && ctrl.ref !== ref) {
    ctrl.ref?.current.delete(ctrl)
    ref.current.add(ctrl)
    ctrl.ref = ref
  }
}
