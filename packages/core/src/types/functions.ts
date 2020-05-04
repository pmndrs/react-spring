import { OneOrMore, Lookup, Falsy } from 'shared'

import { Controller, ControllerQueue } from '../Controller'
import { SpringValue } from '../SpringValue'
import { RunAsyncProps } from '../runAsync'
import { AsyncResult, AnimationResult } from '../objects'
import {
  SpringTo,
  SpringsUpdate,
  InlineToProps,
  SpringChain,
  SpringProps,
  ControllerProps,
  GoalValue,
  GoalValues,
} from './props'
import { IsPlainObject } from './common'

/** The flush function that handles `start` calls */
export type ControllerFlushFn<State extends Lookup> = (
  ctrl: Controller<State>,
  queue: ControllerQueue<State>
) => AsyncResult<State>

/**
 * An async function that can update or stop the animations of a spring.
 * Typically defined as the `to` prop.
 *
 * The `T` parameter can be a set of animated values (as an object type)
 * or a primitive type for a single animated value.
 */
export interface SpringToFn<T = unknown> extends Function {
  (update: SpringStartFn<T>, stop: SpringStopFn<T>): Promise<any> | void
}

/**
 * Update the props of an animation.
 *
 * The `T` parameter can be a set of animated values (as an object type)
 * or a primitive type for a single animated value.
 */
export type SpringUpdateFn<T = any> = T extends IsPlainObject<T>
  ? UpdateValuesFn<T>
  : UpdateValueFn<T>

interface AnyUpdateFn<T, Props extends object> {
  (to: SpringTo<T>, props?: Props): AsyncResult<T>
  (props: { to?: SpringToFn<T> | Falsy } & Props): AsyncResult<T>
  (props: { to?: SpringChain<T> | Falsy } & Props): AsyncResult<T>
}

/**
 * Update the props of a `Controller` object or `useSpring` call.
 *
 * The `T` parameter must be a set of animated values (as an object type).
 */
interface UpdateValuesFn<State extends Lookup = Lookup>
  extends AnyUpdateFn<State, ControllerProps<State>> {
  (props: InlineToProps<State> & ControllerProps<State>): AsyncResult<State>
  (
    props: {
      to?: GoalValues<State> | Falsy
    } & ControllerProps<State>
  ): AsyncResult<State>
}

/**
 * Update the props of a spring.
 *
 * The `T` parameter must be a primitive type for a single animated value.
 */
interface UpdateValueFn<T = any> extends AnyUpdateFn<T, SpringProps<T>> {
  (props: { to?: GoalValue<T> | Falsy } & SpringProps<T>): AsyncResult<T>
}

/**
 * Start the animation described by the `props` argument.
 *
 * If nothing is passed, flush the `update` queue.
 */
export interface SpringStartFn<State = unknown> {
  (props?: SpringsUpdate<State> | null): AsyncResult<State[]>
}

/**
 * Stop every animating `SpringValue` at its current value.
 *
 * Pass one or more keys to stop selectively.
 *
 * The `T` parameter can be a set of animated values (as an object type)
 * or a primitive type for a single animated value.
 */
export type SpringStopFn<T = unknown> = T extends object
  ? T extends ReadonlyArray<number | string>
    ? () => void
    : (keys?: OneOrMore<string>) => void
  : () => void

/**
 * Pause animating `SpringValue`.
 *
 * The `T` parameter can be a set of animated values (as an object type)
 * or a primitive type for a single animated value.
 */
export type SpringPauseFn<T = unknown> = T extends object
  ? T extends ReadonlyArray<number | string>
    ? () => void
    : (keys?: OneOrMore<string>) => void
  : () => void

/**
 * Resume paused `SpringValue`.
 *
 * The `T` parameter can be a set of animated values (as an object type)
 * or a primitive type for a single animated value.
 */
export type SpringResumeFn<T = unknown> = T extends object
  ? T extends ReadonlyArray<number | string>
    ? () => void
    : (keys?: OneOrMore<string>) => void
  : () => void

/**
 * Called before the first frame of every animation.
 * From inside the `requestAnimationFrame` callback.
 */
export type OnStart<T = unknown> = (spring: SpringValue<T>) => void

/** Called when a `SpringValue` changes */
export type OnChange<T = unknown> = (value: T, source: SpringValue<T>) => void

/** Called once the animation comes to a halt */
export type OnRest<T = unknown> = (result: AnimationResult<T>) => void

/**
 * Called after an animation is updated by new props,
 * even if the animation remains idle.
 */
export type OnProps<T = unknown> = (
  props: Readonly<RunAsyncProps<T>>,
  spring: SpringValue<T>
) => void

/**
 * Called after any delay has finished.
 */
export type OnDelayEnd<T = unknown> = (
  props: RunAsyncProps<T>,
  spring: SpringValue<T>
) => void

export type AnimationResolver<T> = (
  result: AnimationResult<T> | AsyncResult<T>
) => void
