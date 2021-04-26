import type { Lookup } from '@react-spring/types'
import type { FluidValue } from '@react-spring/shared'
import type { Controller } from '../Controller'
import type { SpringValue } from '../SpringValue'
import type { AsyncResult, AnimationResult } from './objects'
import type {
  ControllerUpdate,
  ReservedEventProps,
  SpringUpdate,
} from './props'

/** @internal */
export interface Readable<T = any> {
  get(): T
}

/** @internal */
export type InferState<T extends Readable> = T extends Controller<infer State>
  ? State
  : T extends SpringValue<infer U>
  ? U
  : unknown

/** @internal */
export type InferProps<T extends Readable> = T extends Controller<infer State>
  ? ControllerUpdate<State>
  : T extends SpringValue<infer U>
  ? SpringUpdate<U>
  : Lookup

/** @internal */
export type InferTarget<T> = T extends object
  ? T extends ReadonlyArray<number | string>
    ? SpringValue<T>
    : Controller<T>
  : SpringValue<T>

/** @internal */
export interface AnimationTarget<T = any> extends Readable<T> {
  start(props: any): AsyncResult<this>
  stop: Function
  item?: unknown
}

/** @internal */
export interface AnimationRange<T> {
  to: T | FluidValue<T> | undefined
  from: T | FluidValue<T> | undefined
}

/** @internal */
export type AnimationResolver<T extends Readable> = (
  result: AnimationResult<T> | AsyncResult<T>
) => void

/** @internal */
export type EventKey = Exclude<
  keyof ReservedEventProps,
  'onResolve' | 'onDestroyed'
>

/** @internal */
export type PickEventFns<T> = {
  [P in Extract<keyof T, EventKey>]?: Extract<T[P], Function>
}
