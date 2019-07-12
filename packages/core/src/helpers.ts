import { is, Merge, Remap, each } from 'shared'
import { ReservedProps, ForwardProps } from './types/common'

declare const process:
  | { env: { [key: string]: string | undefined } }
  | undefined

export function fillArray<T>(length: number, mapIndex: (index: number) => T) {
  const arr = []
  for (let i = 0; i < length; i++) arr.push(mapIndex(i))
  return arr
}

export function withDefault<T, DT>(value: T, defaultValue: DT) {
  return value == null ? defaultValue : value!
}

export function callProp<T>(
  obj: T,
  ...args: any[]
): T extends (...args: any[]) => infer R ? R : T {
  return is.fun(obj) ? obj(...args) : obj
}

/**
 * Extract any properties whose keys are *not* reserved for customizing your
 * animations. All hooks use this function, which means `useTransition` props
 * are reserved for `useSpring` calls, etc.
 */
function getForwardProps<Props extends ReservedProps>(
  props: Props
): ForwardProps<Props> {
  const {
    children,
    config,
    from,
    to,
    ref,
    reset,
    cancel,
    reverse,
    immediate,
    delay,
    lazy,
    items,
    trail,
    unique,
    initial,
    enter,
    leave,
    update,
    onAnimate,
    onStart,
    onRest,
    onFrame,
    onDestroyed,
    timestamp,
    attach,
    ...forward
  } = props
  return forward
}

type InterpolateTo<T extends object> = Remap<
  Merge<{ to: ForwardProps<T> }, Pick<T, keyof T & keyof ReservedProps>>
>

export function interpolateTo<T extends ReservedProps>(
  props: T
): InterpolateTo<T> {
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
