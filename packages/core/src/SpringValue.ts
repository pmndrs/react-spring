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
import { SpringConfig, Animatable, RangeProps } from './types/spring'
import { Indexable, Merge } from './types/common'
import { runAsync, AsyncResult, RunAsyncState } from './runAsync'
import { callProp } from './helpers'
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
export type AnimationResult<T = unknown> = Readonly<{
  finished: boolean
  value: T
  spring?: SpringValue<T>
}>

/** An animation being executed by the frameloop */
export interface Animation<T = unknown> {
  values: readonly AnimatedValue[]
  to: T | FluidValue<T>
  toValues: readonly number[] | null
  from: T | FluidValue<T>
  fromValues: readonly number[]
  config: {
    w0: number
    mass: number
    tension: number
    friction: number
    velocity: number | number[]
    precision?: number
    easing: EasingFunction
    progress: number
    duration?: number
    clamp?: boolean | number
    decay?: boolean | number
  }
  reverse?: boolean
  immediate: boolean
  onChange?: OnChange<T>
  onRest?: Array<OnRest<T>>
  owner: SpringValue<T>
}

/** Props that can have default values */
export type DefaultProps<T = unknown> = Pick<
  PendingProps<T>,
  'config' | 'immediate' | 'onAnimate' | 'onStart' | 'onChange' | 'onRest'
>

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
  /** The default props */
  defaultProps: DefaultProps<T>
  /** The queue of pending props */
  queue?: PendingProps<T>[]
  /** @internal The animated node. Do not touch! */
  node!: AnimatedNode<T>
  /** @internal Determines order of animations on each frame */
  priority = 0
  /** The lifecycle phase of this spring */
  protected _phase = CREATED
  /** The last time each prop changed */
  protected _timestamps?: Indexable<number>
  /** The prop cache for async state */
  protected _asyncProps?: RunAsyncState<T, P>
  /** Cancel any update from before this timestamp */
  protected _deadline = 0
  /** Objects that want to know when this spring changes */
  protected _children = new Set<SpringObserver<T>>()

  constructor(readonly key: P, defaults?: DefaultProps<T>) {
    super()
    this.defaultProps = defaults ? Object.setPrototypeOf({}, defaults) : {}
  }

  get idle() {
    return !this.is(ACTIVE)
  }

  /** Check the current phase */
  is(phase: Phase) {
    return this._phase == phase
  }

  /** Get the current value */
  get(): T {
    return this.node.getValue() as any
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
    if (this.is(ACTIVE)) {
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
    if (this.is(ACTIVE)) {
      if (is.und(to)) {
        to = this.animation!.to
      }
      if (isFluidValue(to)) {
        to = to.get()
      }
      this.node.setValue(to)
      this._onChange(to, true)
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
    const props = is.obj(to) ? to : ({ ...arg2, to } as any)

    // Ensure the initial value can be accessed by animated components.
    const range = this.getRange(props)
    if (!this.node) {
      this.node = this.createNode(range)!
    }

    if (is.fun(props.to) || is.arr(props.to)) {
      return runAsync(
        props.to,
        props,
        this._asyncProps || (this._asyncProps = {}),
        () => this.get(),
        () => this.is(PAUSED),
        this.animate.bind(this) as any,
        this.stop.bind(this) as any
      )
    }

    return new Promise<AnimationResult<T>>(resolve => {
      const timestamp = G.now()
      const update = () => {
        this._animate(range, props, timestamp, resolve)
      }

      const delay = callProp(props.delay, this.key)
      if (delay > 0) setTimeout(update, delay)
      else update()
    })
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
      this._phase = ACTIVE
      G.frameLoop.start(this)

      const asyncProps = this._asyncProps
      if (asyncProps && asyncProps.asyncTo) {
        asyncProps.unpause!()
      }
    }

    const queue = this.queue || []
    this.queue = []

    let lastResult: AnimationResult<T> | undefined
    await Promise.all(
      queue.map(async props => {
        lastResult = await this.animate(props)
      })
    )

    return (
      lastResult || {
        finished: true,
        value: this.get(),
        spring: this as any,
      }
    )
  }

  /**
   * Stop the animation on its next frame, and prevent updates from before the
   * `timestamp` argument, which defaults to the current time.
   */
  stop(timestamp = G.now()) {
    if (!this.is(DISPOSED)) {
      this._deadline = timestamp
      const anim = this.animation
      if (anim) {
        this._animateTo(this.get())
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
  }

  /** @internal */
  onParentPriorityChange(priority: number) {
    this._setPriority(priority)
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
    props: PendingProps<T>,
    timestamp: number,
    onRest: OnRest<T>
  ) {
    // Might be cancelled before start.
    if (timestamp < this._deadline) {
      return
    }

    /** Get the value of a prop, or its default value */
    const get = <K extends keyof DefaultProps>(prop: K): DefaultProps<T>[K] =>
      prop in props ? props[prop] : this.defaultProps[prop]

    const onAnimate = get('onAnimate')
    if (onAnimate) {
      onAnimate(props, this)
    }

    const { key } = this
    const { cancel, reset } = props

    if (cancel && (cancel === true || toArray(cancel).includes(key))) {
      this.stop(timestamp)
      return
    }

    // Cast from a partial type.
    const anim: Partial<Animation<T>> = this.animation || { owner: this }
    this.animation = anim as Animation<T>

    /** Return true if our prop can be used */
    const timestamps = this._timestamps || (this._timestamps = {})
    const diff = (prop: string) => {
      if (timestamp >= (timestamps[prop] || 0)) {
        timestamps[prop] = timestamp
        return true
      }
      return false
    }

    const prevTo = anim.to

    // Write or read the "to" prop
    if (!is.und(to) && diff('to')) {
      this._animateTo(to)
    } else {
      to = prevTo
    }

    // Write or read the "from" prop
    if (!is.und(from) && diff('from')) {
      anim.from = from
    } else if (reset) {
      from = anim.from
    }

    // The "reverse" prop only affects one update.
    if (props.reverse) [to, from] = [from, to]

    // Use the current value when "from" is undefined.
    if (is.und(from)) {
      from = this.get()
    }
    // Start from the current value of another Spring.
    else if (isFluidValue(from)) {
      from = from.get()
    }

    const changed = !(is.und(to) || isEqual(to, prevTo))
    const isActive = this.is(ACTIVE)

    // Only use the default "config" prop on first animation.
    let config = props.config as Animation['config']
    if (!config && !anim.config) {
      config = callProp(this.defaultProps.config as any, key)
    }

    // The "config" prop can be updated without cancelling out configs from
    // delayed updates, but only if the delayed update has a new goal value.
    if (config && (diff('config') || changed)) {
      config = callProp(config as any, key)
      if (config) {
        config = { ...BASE_CONFIG, ...config }

        // Cache the angular frequency in rad/ms
        config.w0 = Math.sqrt(config.tension / config.mass) / 1000

        if (
          anim.config &&
          is.und(config.decay) == is.und(anim.config.decay) &&
          is.und(config.duration) == is.und(anim.config.duration)
        ) {
          Object.assign(anim.config, config)
        } else {
          anim.config = config
        }
      }
    }

    // The `FrameLoop` decides our goal value when `to` is a dependency.
    let goal: any = isFluidValue(to) ? null : computeGoal(to)

    // Update our internal `Animated` node.
    let node = this.node
    let nodeType: AnimatedType<T>
    if (changed) {
      nodeType = this._getNodeType(to!)
      invariant(
        node.constructor == nodeType,
        `Cannot animate to the given "to" prop, because the current value has a different type`
      )
      node.reset(isActive, goal)
      anim.values = node.getPayload()
    } else {
      nodeType = node.constructor as any
    }

    if (nodeType == AnimatedString) {
      from = 0 as any
      goal = 1
    }

    if (changed) {
      anim.toValues = isFluidValue(to) ? null : toArray(goal)
    }

    if (reset) {
      // Assume "from" has been converted to a number.
      anim.fromValues = toArray(from as any)
    } else if (changed) {
      anim.fromValues = node.getPayload().map(node => node.getValue())
    }

    // Event props are provided per update.
    if (changed) {
      anim.onChange = get('onChange')

      // Call the "onRest" callback for an unfinished animation.
      const onRestQueue: OnRest<T>[] = anim.onRest || []
      if (onRestQueue.length > 1) {
        const result: AnimationResult<T> = {
          finished: false,
          value: this.get(),
          spring: this,
        }
        for (let i = 1; i < onRestQueue.length; i++) {
          onRestQueue[i](result)
        }
      }

      // The "onRest" prop is always first in the queue.
      anim.onRest = [get('onRest') || noop, onRest]
    }

    let started = reset || changed
    if (started) {
      anim.immediate =
        !(is.num(goal) || isFluidValue(to)) || !!callProp(get('immediate'), key)

      const onStart = get('onStart')
      if (onStart) onStart(this)
    }

    if (!isActive && started) {
      this._phase = ACTIVE
      if (G.skipAnimation) {
        this.finish(to)
      } else {
        G.frameLoop.start(this)
      }
    }
  }

  /** Update the `animation.to` value, which might be a dependency */
  protected _animateTo(value: T | FluidValue<T>) {
    const anim = this.animation!
    if (isFluidValue(anim.to)) {
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
    this.priority = priority
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

  /** Stop without calling `node.setValue` */
  protected _stop(finished = false) {
    if (this.is(ACTIVE)) {
      this._phase = IDLE
      G.frameLoop.stop(this)

      const anim = this.animation!
      each(anim.values, node => {
        node.done = true
      })

      const onRestQueue = anim.onRest!
      anim.onRest = undefined

      const result = { value: this.get(), finished, spring: this }
      each(onRestQueue, onRest => onRest(result))
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
      return this._getNodeType(value).create(computeGoal(from))
    }
  }

  /** @internal */
  get hasChildren() {
    return !!(
      this._children.size ||
      (this.animation && this.animation.onChange)
    )
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
