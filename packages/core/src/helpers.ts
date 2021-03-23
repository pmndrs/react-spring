import {
  is,
  toArray,
  eachProp,
  getFluidValue,
  isAnimatedString,
  FluidValue,
  Globals as G,
} from '@react-spring/shared'
import { AnyFn, OneOrMore, Lookup } from '@react-spring/types'
import { ReservedProps, ForwardProps, InferTo } from './types'
import type { Controller } from './Controller'
import type { SpringRef } from './SpringRef'

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

export const resolveProp = <T>(
  prop: T | Lookup<T> | undefined,
  key: string | undefined
) => (is.obj(prop) ? key && (prop as any)[key] : prop)

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

const noopTransform = (value: any) => value

/**
 * Extract the default props from an update.
 *
 * When the `default` prop is falsy, this function still behaves as if
 * `default: true` was used. The `default` prop is always respected when
 * truthy.
 */
export const getDefaultProps = <T extends Lookup>(
  props: Lookup,
  transform: (value: any, key: string) => any = noopTransform
): T => {
  let keys: readonly string[] = DEFAULT_PROPS
  if (props.default && props.default !== true) {
    props = props.default
    keys = Object.keys(props)
  }
  const defaults: any = {}
  for (const key of keys) {
    const value = transform(props[key], key)
    if (!is.und(value)) {
      defaults[key] = value
    }
  }
  return defaults
}

/**
 * These props are implicitly used as defaults when defined in a
 * declarative update (eg: render-based) or any update with `default: true`.
 *
 * Use `default: {}` or `default: false` to opt-out of these implicit defaults
 * for any given update.
 *
 * Note: These are not the only props with default values. For example, the
 * `pause`, `cancel`, and `immediate` props. But those must be updated with
 * the object syntax (eg: `default: { immediate: true }`).
 */
export const DEFAULT_PROPS = [
  'config',
  'onProps',
  'onStart',
  'onChange',
  'onPause',
  'onResume',
  'onRest',
] as const

const RESERVED_PROPS: {
  [key: string]: 1 | undefined
} = {
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
  onProps: 1,
  onStart: 1,
  onChange: 1,
  onPause: 1,
  onResume: 1,
  onRest: 1,
  onResolve: 1,

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
  onDestroyed: 1,

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
  eachProp(props, (value, prop) => {
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
    eachProp(props, (val, key) => key in to || (out[key] = val))
    return out
  }
  return { ...props } as any
}

// Compute the goal value, converting "red" to "rgba(255, 0, 0, 1)" in the process
export function computeGoal<T>(value: T | FluidValue<T>): T {
  value = getFluidValue(value)
  return is.arr(value)
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
  ctrl.ref?.delete(ctrl)
  ref?.delete(ctrl)
}

/** Replace `ctrl.ref` with the given `ref` (if defined) */
export function replaceRef(ctrl: Controller, ref?: SpringRef) {
  if (ref && ctrl.ref !== ref) {
    ctrl.ref?.delete(ctrl)
    ref.add(ctrl)
    ctrl.ref = ref
  }
}
