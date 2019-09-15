import { deprecateInterpolate } from 'shared/deprecations'
import {
  is,
  each,
  needsInterpolation,
  EasingFunction,
  toArray,
  InterpolatorArgs,
  FluidObserver,
  isFluidValue,
  FluidValue,
} from 'shared'
import {
  AnimationValue,
  isAnimationValue,
  AnimatedValue,
  AnimatedString,
  AnimatedArray,
} from '@react-spring/animated'
import invariant from 'tiny-invariant'
import * as G from 'shared/globals'

import {
  AnimatedNode,
  AnimatedType,
  AnimationRange,
  AnimationProps,
} from './types/animated'
import {
  runAsync,
  scheduleProps,
  AsyncResult,
  RunAsyncState,
  RunAsyncProps,
} from './runAsync'
import { SpringConfig, Animatable, RangeProps } from './types/spring'
import { Indexable, Merge } from './types/common'
import { callProp, DEFAULT_PROPS, DefaultProps, matchProp } from './helpers'
import { config } from './constants'
import { To } from './To'

/** Called before the given props are applied */
export type OnAnimate<T = unknown> = (
  props: PendingProps<T>,
  spring: SpringValue<T>
) => void

/** Called before the animation is added to the frameloop */
export type OnStart<T = unknown> = (spring: SpringValue<T>) => void

/** Called whenever the animated value is changed */
export type OnChange<T = unknown> = (value: T, spring: SpringValue<T>) => void

/** Called once the animation comes to a halt */
export type OnRest<T = unknown> = (result: AnimationResult<T>) => void

/** The object passed to `onRest` props */
export type AnimationResult<T = any> = Readonly<{
  value: T
  spring?: SpringValue<T>
  /** When falsy, the animation did not reach its end value. */
  finished?: boolean
  /** When true, the animation was cancelled before it could finish. */
  cancelled?: boolean
}>

export interface AnimationConfig {
  w0: number
  mass: number
  tension: number
  speed?: number
  friction: number
  velocity: number | number[]
  restVelocity?: number
  precision?: number
  easing: EasingFunction
  progress: number
  duration?: number
  clamp?: boolean | number
  decay?: boolean | number
}

/** An animation being executed by the frameloop */
export interface Animation<T = unknown> {
  values: readonly AnimatedValue[]
  to: T | FluidValue<T>
  toValues: readonly number[] | null
  from: T | FluidValue<T>
  fromValues: readonly number[]
  config: AnimationConfig
  reverse?: boolean
  immediate: boolean
  onStart?: OnStart<T>
  onChange?: OnChange<T>
  onRest?: Array<OnRest<T>>
  owner: SpringValue<T>
}

/** Pending props for a single `SpringValue` object */
export type PendingProps<T = unknown> = Merge<
  AnimationProps<T>,
  {
    to?: RangeProps<T>['to']
    from?: RangeProps<T>['from']
    onRest?: OnRest<T> | null
    onStart?: OnStart<T>
    onChange?: OnChange<T>
    onAnimate?: OnAnimate<T>
  }
>

// TODO: use "const enum" when Babel supports it
type Phase = number & { __type: 'Phase' }
/** The spring cannot be animated */
const DISPOSED = 0 as Phase
/** The spring has not animated yet */
const CREATED = 1 as Phase
/** The spring has animated before */
const IDLE = 2 as Phase
/** The spring is frozen in time */
const PAUSED = 3 as Phase
/** The spring is animating */
const ACTIVE = 4 as Phase

const noop = () => {}

const BASE_CONFIG: SpringConfig = {
  ...config.default,
  mass: 1,
  velocity: 0,
  progress: 0,
  easing: t => t,
  clamp: false,
}

/** An observer of a `SpringValue` */
export type SpringObserver<T = any> = OnChange<T> | FluidObserver<T>

/** An opaque animatable value */
export class SpringValue<T = any, P extends string = string>
  extends AnimationValue<T>
  implements FluidObserver<T> {
  static phases = { DISPOSED, CREATED, IDLE, PAUSED, ACTIVE }
  /** The animation state */
  animation?: Animation<T>
  /** The queue of pending props */
  queue?: PendingProps<T>[]
  /** @internal The animated node. Do not touch! */
  node!: AnimatedNode<T>
  /** @internal Determines order of animations on each frame */
  priority = 0
  /** The lifecycle phase of this spring */
  protected _phase = CREATED
  /** The state for `runAsync` calls */
  protected _state: RunAsyncState<T, P>
  /** The last time each prop changed */
  protected _timestamps?: Indexable<number>
  /** Some props have customizable default values */
  protected _defaultProps: PendingProps<T> = {}
  /** Cancel any update from before this timestamp */
  protected _lastAsyncId = 0
  /** Objects that want to know when this spring changes */
  protected _children = new Set<SpringObserver<T>>()

  constructor(readonly key: P) {
    super()
    this._state = { key }
  }

  get idle() {
    return !this.is(ACTIVE)
  }

  /** Check the current phase */
  is(phase: Phase) {
    return this._phase == phase
  }

  /** Get the current value */
  get(): T
  get<P extends keyof Animation>(prop: P): Animation<T>[P] | undefined
  get(prop?: keyof Animation) {
    return prop ? this.animation && this.animation[prop] : this.node.getValue()
  }

  /** Set the current value, while stopping the current animation */
  set(value: T, notify = true) {
    this.node.setValue(value)
    if (notify) {
      this._onChange(value)
    }
    this._stop()
    return this
  }

  /**
   * Freeze the active animation in time.
   * This does nothing when not animating.
   *
   * Call `start` to unpause.
   */
  pause() {
    this._checkDisposed('pause')
    if (!this.idle) {
      this._phase = PAUSED
      G.frameLoop.stop(this)
    }
  }

  /**
   * Skip to the end of the current animation.
   *
   * All `onRest` callbacks are passed `{finished: true}`
   */
  finish(to?: T | FluidValue<T>) {
    if (!this.idle) {
      const anim = this.animation!
      const value = this.get()

      // Decay animations finish when their velocity hits zero,
      // so their goal value is implicit.
      if (is.und(to) && anim.config.decay) {
        to = value
      } else {
        if (is.und(to)) to = anim.to
        if (isFluidValue(to)) to = to.get()
        if (!isEqual(value, to)) {
          this.node.setValue(to)
          this._onChange(to, true)
        }
      }

      this._stop(true)
    }
    return this
  }

  /** Create a spring that maps our value to another value */
  to<Out>(...args: InterpolatorArgs<T, Out>) {
    this._checkDisposed('to')
    return G.to(this, args) as To<T, Out>
  }

  /** @deprecated Use the `to` method instead. */
  interpolate<Out>(...args: InterpolatorArgs<T, Out>) {
    deprecateInterpolate()
    this._checkDisposed('interpolate')
    return G.to(this, args) as To<T, Out>
  }

  animate(props: PendingProps<T>): AsyncResult<T>

  animate(to: Animatable<T>, props?: PendingProps<T>): AsyncResult<T>

  /** Update this value's animation using the given props. */
  animate(to: PendingProps<T> | Animatable<T>, arg2?: PendingProps<T>) {
    this._checkDisposed('animate')
    const props: any = is.obj(to) ? to : { ...arg2, to }

    // Ensure the initial value can be accessed by animated components.
    const range = this.getRange(props)
    if (!this.node) {
      this.node = this.createNode(range)!
    }

    const timestamp = G.now()
    return scheduleProps<T, AnimationResult<T>>(
      ++this._lastAsyncId,
      props,
      this._state,
      (props, resolve) => {
        const { to } = props
        if (is.arr(to) || is.fun(to)) {
          resolve(
            runAsync(
              to as any,
              props,
              this._state,
              () => this.get(),
              () => this.is(PAUSED),
              this.animate.bind(this) as any,
              this.stop.bind(this) as any
            )
          )
        } else if (props.cancel) {
          this.stop()
          resolve({
            value: this.get(),
            cancelled: true,
          })
        } else {
          this._animate(range, props, timestamp, resolve)
        }
      }
    )
  }

  /** Push props into the pending queue. */
  update(props: PendingProps<T>) {
    this._checkDisposed('update')
    const queue = this.queue || (this.queue = [])
    queue.push(props)

    // Ensure the initial value can be accessed by animated components.
    if (!this.node) {
      this.node = this.createNode(this.getRange(props))!
    }
    return this
  }

  /**
   * Update this value's animation using the queue of pending props,
   * and unpause the current animation (if one is frozen).
   */
  async start(): AsyncResult<T> {
    this._checkDisposed('start')

    // Unpause if possible.
    if (this.is(PAUSED)) {
      this._start()

      if (this._state.asyncTo) {
        this._state.unpause!()
      }
    }

    const queue = this.queue || []
    this.queue = []

    await Promise.all(
      queue.map(async props => {
        await this.animate(props)
      })
    )

    return {
      finished: true,
      value: this.get(),
      spring: this,
    }
  }

  /**
   * Stop the current animation, and cancel any delayed updates.
   */
  stop() {
    if (!this.is(DISPOSED)) {
      this._state.cancelId = this._lastAsyncId
      const anim = this.animation
      if (anim) {
        this._to(this.get())
        this._stop()
      }
    }
    return this
  }

  /** Restart the animation. */
  reset() {
    this.animate({ reset: true })
  }

  /** Prevent future animations, and stop the current animation */
  dispose() {
    if (!this.is(DISPOSED)) {
      if (this.animation) {
        // Prevent "onRest" calls when disposed.
        this.animation.onRest = undefined
      }
      this.stop()
      this._phase = DISPOSED
    }
  }

  /** Observe value changes. To stop observing, call the returned function. */
  onChange(fn: OnChange<T>): () => void {
    this._children.add(fn)
    return () => this._children.delete(fn)
  }

  /** @internal */
  onParentChange(value: any, finished: boolean) {
    // The "FrameLoop" handles everything other than immediate animation.
    if (this.animation!.immediate) {
      if (finished) {
        this.finish(value)
      } else {
        this.set(value)
      }
    }
    // When our parent is not a spring, it won't tell us to enter the frameloop
    // because it never does so itself. Instead, we must react to value changes.
    else if (this.idle && !isEqual(value, this.get())) {
      this._start()
    }
  }

  /** @internal */
  onParentPriorityChange(priority: number) {
    this._setPriority(priority + 1)
  }

  protected _checkDisposed(name: string) {
    invariant(
      !this.is(DISPOSED),
      `Cannot call "${name}" of disposed "${this.constructor.name}" object`
    )
  }

  /** Return the `Animated` node constructor for a given value */
  protected _getNodeType(value: T | FluidValue<T>): AnimatedType<T> {
    const parent = isAnimationValue(value) ? value : null
    const parentType = parent && (parent.node.constructor as any)
    if (!parent && isFluidValue(value)) {
      value = value.get()
    }
    return parentType == AnimatedString
      ? AnimatedValue
      : parentType ||
          (is.arr(value)
            ? AnimatedArray
            : needsInterpolation(value)
            ? AnimatedString
            : AnimatedValue)
  }

  /** Update the internal `animation` object */
  protected _animate(
    { to, from }: AnimationRange<T>,
    props: RunAsyncProps<T>,
    timestamp: number,
    resolve: OnRest<T>
  ): void {
    const defaultProps = this._defaultProps

    /** Get the value of a prop, or its default value */
    const get = <K extends DefaultProps>(prop: K): PendingProps<T>[K] =>
      !is.und(props[prop]) ? props[prop] : defaultProps[prop]

    const onAnimate = get('onAnimate')
    if (onAnimate) {
      onAnimate(props, this)
    }

    // Cast from a partial type.
    const anim: Partial<Animation<T>> = this.animation || { owner: this }
    this.animation = anim as Animation<T>

    /** Where per-prop timestamps are kept */
    const timestamps = this._timestamps || (this._timestamps = {})

    /** Return true if our prop can be used. This only affects delayed props. */
    const diff = (prop: string) => {
      if (timestamp >= (timestamps[prop] || 0)) {
        timestamps[prop] = timestamp
        return true
      }
      return false
    }

    const { to: prevTo, from: prevFrom } = anim

    // The "reverse" prop only affects one update.
    if (props.reverse) [to, from] = [from, to]

    if (!is.und(to) && diff('to')) {
      this._to(to)
    } else {
      to = prevTo
    }

    if (!is.und(from) && diff('from')) {
      anim.from = from
    } else {
      from = anim.from
    }
    if (is.und(from)) {
      from = to
    }
    if (isFluidValue(from)) {
      from = from.get()
    }

    const reset = props.reset && !is.und(from) && !is.und(to)
    const changed = !is.und(to) && !isEqual(to, prevTo)
    const parent = isFluidValue(to) && to

    /** The current value */
    let value = reset ? from! : this.get()

    /** When true, this spring must be in the frameloop. */
    let started =
      !is.und(to) &&
      (parent
        ? !isEqual(value, parent.get())
        : (changed || reset) && !isEqual(value, to))

    // The "config" prop either overwrites or merges into the existing config.
    let config = props.config as AnimationConfig
    if (config || started || !anim.config) {
      config = {
        ...callProp(defaultProps.config, this.key),
        ...callProp(config, this.key),
      }

      if (!started && canMergeConfigs(config, anim.config)) {
        Object.assign(anim.config, config)
      } else {
        anim.config = config = { ...BASE_CONFIG, ...config }
      }

      // When "speed" is provided, we derive "tension" and "friction" from it.
      if (!is.und(config.speed)) {
        config.tension = Math.pow((2 * Math.PI) / config.speed, 2) * config.mass
        // Note: We treat "friction" as the *damping ratio* instead of as its coefficient.
        config.friction =
          (4 * Math.PI * config.friction * config.mass) / config.speed
      }

      // Cache the angular frequency in rad/ms
      config.w0 = Math.sqrt(config.tension / config.mass) / 1000
    } else {
      config = anim.config
    }

    // Always start animations with velocity.
    if (!started && this.idle && (config.decay || !is.und(to))) {
      const { velocity } = config
      if (toArray(velocity).some(v => v !== 0)) {
        started = true
      }
    }

    /**
     * The final value of the animation.
     *
     * The `FrameLoop` decides our goal value when a `parent` exists.
     */
    let goal: any = parent ? null : computeGoal(to)

    // Reset our internal `Animated` node if starting.
    let node = this.node
    let nodeType: AnimatedType<T>
    if (changed) {
      nodeType = this._getNodeType(to!)
      invariant(
        nodeType == node.constructor,
        `Cannot animate to the given "to" prop, because the current value has a different type`
      )
    } else {
      nodeType = node.constructor as any
    }

    if (nodeType == AnimatedString) {
      from = 0 as any
      goal = 1
    }

    // The current value must equal the "from" value on reset
    // and before the first animation.
    if (
      reset ||
      (this.is(CREATED) &&
        (!is.und(anim.from) && !isEqual(anim.from, prevFrom)))
    ) {
      node.setValue((value = from as T))
    }

    // The "fromValues" must be updated whenever an animation starts.
    if (started) {
      this._reset()
      anim.values = node.getPayload()
      anim.toValues = parent ? null : toArray(goal)
      anim.fromValues = anim.values.map(node => node.lastPosition)
    }

    anim.immediate =
      !(parent || is.num(goal) || is.arr(goal)) ||
      !!matchProp(get('immediate'), this.key)

    // The "onRest" prop is never called for immediate animations.
    const onRest = (!anim.immediate && get('onRest')) || noop

    // Event props are replaced on every update.
    anim.onStart = get('onStart')
    anim.onChange = get('onChange')

    // Update the default props.
    if (props.default) {
      each(DEFAULT_PROPS, prop => {
        // Default props can only be null, an object, or a function.
        if (/function|object/.test(typeof props[prop])) {
          defaultProps[prop] = props[prop] as any
        }
      })
    }

    if (!started) {
      // Resolve the "animate" promise.
      return resolve({
        value,
        spring: this,
        finished: true,
      })
    }

    // Resolve the promise for unfinished animations.
    const onRestQueue = anim.onRest
    if (onRestQueue && onRestQueue.length > 1) {
      const result: AnimationResult<T> = {
        value,
        spring: this,
        cancelled: true,
      }
      // Skip the "onRest" prop, as the animation is still active.
      for (let i = 1; i < onRestQueue.length; i++) {
        onRestQueue[i](result)
      }
    }

    // The "onRest" prop is always first in the queue.
    anim.onRest = [onRest, resolve]

    this._start()
  }

  /** Update the `animation.to` value, which might be a `FluidValue` */
  protected _to(value: T | FluidValue<T>) {
    const anim = this.animation!
    if (isFluidValue(anim.to)) {
      if (value == anim.to) return
      anim.to.removeChild(this)
    }
    anim.to = value
    if (isFluidValue(value)) {
      value.addChild(this)
      this._setPriority((value.priority || 0) + 1)
    } else {
      this._setPriority(0)
    }
  }

  protected _setPriority(priority: number) {
    if (this.priority == priority) return
    this.priority = priority
    if (!this.idle) {
      // Re-enter the frameloop so our new priority is used.
      G.frameLoop.stop(this).start(this)
    }
    for (const observer of Array.from(this._children)) {
      if ('onParentPriorityChange' in observer) {
        observer.onParentPriorityChange(priority, this)
      }
    }
  }

  /** @internal */
  public _onChange(value: T, finished = false) {
    // Notify the "onChange" prop first.
    const anim = this.animation
    if (anim && anim.onChange) {
      anim.onChange(value, this)
    }

    // Clone "_children" so it can be safely mutated by the loop.
    for (const observer of Array.from(this._children)) {
      if ('onParentChange' in observer) {
        observer.onParentChange(value, finished, this)
      } else if (!finished) {
        observer(value, this)
      }
    }
  }

  /** Reset our node, and the nodes of every descendant spring */
  protected _reset(goal = computeGoal(this.animation!.to)) {
    this.node.reset(!this.idle, goal)
    each(this._children, child => {
      if (child instanceof SpringValue) {
        child._reset(goal)
      }
    })
  }

  /** Enter the frameloop */
  protected _start() {
    const anim = this.animation!
    if (anim && this.idle) {
      this._phase = ACTIVE

      // Animations without "onRest" cannot enter the frameloop.
      if (anim.onRest) {
        // The "onStart" prop is never called for immediate animations.
        if (anim.onStart && !anim.immediate) {
          anim.onStart(this)
        }
        // The "skipAnimation" global avoids the frameloop.
        if (G.skipAnimation) {
          this.finish(anim.to)
        } else {
          G.frameLoop.start(this)
        }
      }

      // Tell animatable children to enter the frameloop.
      each(this._children, child => {
        if (child instanceof SpringValue) {
          child._start()
        }
      })
    }
  }

  /** Exit the frameloop and notify `onRest` listeners */
  protected _stop(finished = false) {
    if (!this.idle) {
      this._phase = IDLE

      const anim = this.animation!
      const onRestQueue = anim.onRest

      // Animations without "onRest" cannot enter the frameloop.
      if (onRestQueue) {
        G.frameLoop.stop(this)
        each(anim.values, node => {
          node.done = true
        })

        // Preserve the "onRest" prop.
        anim.onRest = [onRestQueue[0]]

        const result = { value: this.get(), spring: this, finished }
        each(onRestQueue, onRest => onRest(result))
      }
    }
  }

  /** @internal Pluck the `to` and `from` props */
  getRange(props: PendingProps<T>) {
    const { to, from } = props
    return {
      to: !is.obj(to) || isFluidValue(to) ? to : to[this.key],
      from: !is.obj(from) || isFluidValue(from) ? from : from[this.key],
    } as AnimationRange<T>
  }

  /** @internal Create an `Animated` node from a set of `to` and `from` props */
  createNode({ to, from }: AnimationRange<T>) {
    const value = is.und(from) ? to : from
    if (!is.und(value)) {
      return this._getNodeType(value).create(computeGoal(value))
    }
  }

  /** @internal */
  addChild(child: SpringObserver<T>): void {
    this._children.add(child)
  }

  /** @internal */
  removeChild(child: SpringObserver<T>): void {
    this._children.delete(child)
  }
}

// Merge configs when the existence of "decay" or "duration" has not changed.
function canMergeConfigs(
  src: AnimationConfig,
  dest: AnimationConfig | undefined
) {
  return (
    !!dest &&
    is.und(src.decay) == is.und(dest.decay) &&
    is.und(src.duration) == is.und(dest.duration)
  )
}

// Compute the goal value, converting "red" to "rgba(255, 0, 0, 1)" in the process
function computeGoal<T>(value: T | FluidValue<T>): T {
  return is.arr(value)
    ? value.map(computeGoal)
    : isFluidValue(value)
    ? computeGoal(value.get())
    : needsInterpolation(value)
    ? (G.createStringInterpolator as any)({
        range: [0, 1],
        output: [value, value],
      })(1)
    : value
}

// Compare animatable values
function isEqual(a: any, b: any) {
  if (is.arr(a)) {
    if (!is.arr(b) || a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false
    }
    return true
  }
  return a === b
}
