import {
  is,
  each,
  isEqual,
  toArray,
  needsInterpolation,
  isFluidValue,
  FluidValue,
  Animatable,
} from 'shared'
import {
  AnimationValue,
  isAnimationValue,
  AnimatedValue,
  AnimatedString,
  AnimatedArray,
  OnChange,
} from '@react-spring/animated'
import invariant from 'tiny-invariant'
import * as G from 'shared/globals'

import { Indexable } from './types/common'
import { SpringConfig, SpringProps, AsyncTo } from './types/spring'
import {
  AnimatedType,
  Animation,
  AnimationRange,
  AnimationResult,
  OnRest,
  AnimationConfig,
  AnimationEvents,
} from './types/animated'
import {
  runAsync,
  scheduleProps,
  AsyncResult,
  RunAsyncState,
  RunAsyncProps,
} from './runAsync'
import { callProp, DEFAULT_PROPS, matchProp } from './helpers'
import { config } from './constants'

/** Default props for a `SpringValue` object */
export type DefaultProps<T = unknown> = {
  [D in (typeof DEFAULT_PROPS)[number]]?: PendingProps<T>[D]
}

/** Pending props for a `SpringValue` object */
export type PendingProps<T = unknown> = unknown &
  SpringProps<T> &
  AnimationEvents<T>

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

/** An opaque animatable value */
export class SpringValue<T = any> extends AnimationValue<T> {
  static phases = { DISPOSED, CREATED, IDLE, PAUSED, ACTIVE }
  /** The animation state */
  animation: Animation<T> = { owner: this } as any
  /** The queue of pending props */
  queue?: PendingProps<T>[]
  /** @internal The animated node. Do not touch! */
  node!: AnimationValue<T>['node']
  /** The lifecycle phase of this spring */
  protected _phase = CREATED
  /** The state for `runAsync` calls */
  protected _state: RunAsyncState<T>
  /** The last time each prop changed */
  protected _timestamps?: Indexable<number>
  /** Some props have customizable default values */
  protected _defaultProps = {} as PendingProps<T>
  /** Cancel any update from before this timestamp */
  protected _lastAsyncId = 0

  constructor(key?: string) {
    super(key)
    this._state = { key }
  }

  get idle() {
    return !this.is(ACTIVE)
  }

  /** Check the current phase */
  is(phase: Phase) {
    return this._phase == phase
  }

  /** Set the current value, while stopping the current animation */
  set(value: T, notify = true) {
    if (this._set(value) && notify) {
      super._onChange(value, true)
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
      const value = this.get()
      const anim = this.animation
      if (is.und(to) && anim.config.decay) {
        // Decay animations finish when their velocity hits zero,
        // so their goal value is implicit.
        to = value
      } else {
        if (is.und(to)) to = anim.to
        if (isFluidValue(to)) to = to.get()
        if (this._set(to)) {
          this._onChange(to, true)
        }
      }

      this._stop(true)
    }
    return this
  }

  animate(props: PendingProps<T>): AsyncResult<T>

  animate(to: Animatable<T>, props?: PendingProps<T>): AsyncResult<T>

  /** Update this value's animation using the given props. */
  animate(to: PendingProps<T> | Animatable<T>, arg2?: PendingProps<T>) {
    this._checkDisposed('animate')

    // The first argument is never cloned.
    const props: PendingProps<T> = is.obj(to) ? (to as any) : { ...arg2, to }

    // Ensure the initial value can be accessed by animated components.
    const range = this.setNodeWithProps(props)

    const timestamp = G.now()
    return scheduleProps(
      ++this._lastAsyncId,
      props,
      this._state,
      (props, resolve) => {
        const { to } = props
        if (is.arr(to) || is.fun(to)) {
          resolve(
            runAsync<T>(
              to as AsyncTo<T>,
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

    // Ensure the initial value can be accessed by animated components.
    this.setNodeWithProps(props)

    const queue = this.queue || (this.queue = [])
    queue.push(props)
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
  onParentChange(value: any, idle: boolean) {
    // The "FrameLoop" handles everything other than immediate animation.
    if (this.animation.immediate) {
      if (idle) {
        this.finish(value)
      } else {
        this.set(value)
      }
    }
    // When our parent is not a spring, it won't tell us to enter the frameloop
    // because it never does so itself. Instead, we must react to value changes.
    else if (this.idle) {
      this._start()
    }
  }

  /**
   * @internal
   * Analyze the given `value` to determine which data type is being animated.
   * Then, create an `Animated` node for that data type and make it our `node`.
   */
  setNodeWithValue(value: any) {
    if (value != null) {
      this.node = this._getNodeType(value).create(computeGoal(value))
    }
  }

  /**
   * @internal
   * Analyze the given `props` to determine which data type is being animated.
   * Then, create an `Animated` node for that data type and make it our `node`.
   * If we already have a `node`, do nothing but return the `{from, to}` range.
   */
  setNodeWithProps(props: PendingProps<T>) {
    const range = this._getRange(props)
    if (!this.node) {
      this.setNodeWithValue(range.from != null ? range.from : range.to)
    }
    return range
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
    const parentType = parent && parent.node && (parent.node.constructor as any)
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
    const get = <K extends keyof DefaultProps>(prop: K) =>
      !is.und(props[prop]) ? props[prop] : defaultProps[prop]

    const onAnimate = get('onAnimate')
    if (onAnimate) {
      onAnimate(props as any, this)
    }

    // Cast from a partial type.
    const anim: Partial<Animation<T>> = this.animation

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

    const reset = props.reset && !is.und(from)
    const changed = !is.und(to) && !isEqual(to, prevTo)
    const parent = isFluidValue(to) && to

    /** The current value */
    let value = reset ? from! : this.get()

    /** When true, this spring must be in the frameloop. */
    let started = parent || ((changed || reset) && !isEqual(value, to))

    /** The initial velocity before this `animate` call. */
    const lastVelocity = anim.config ? anim.config.velocity : 0

    // The "config" prop either overwrites or merges into the existing config.
    let config = props.config as AnimationConfig
    if (config || started || !anim.config) {
      const key = this.key || ''
      config = {
        ...callProp(defaultProps.config, key),
        ...callProp(config, key),
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
    if (!started && (config.decay || !is.und(to))) {
      started = !isEqual(config.velocity, lastVelocity)
    }

    /**
     * The final value of the animation.
     *
     * The `FrameLoop` decides our goal value when a `parent` exists.
     */
    let goal: any = parent ? null : computeGoal(to)

    // Reset our internal `Animated` node if starting.
    let node = this.node!
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

    // Ensure the current value equals the "from" value when reset
    // and when the "from" value is updated before the first animation.
    if (
      reset ||
      (this.is(CREATED) &&
        (!is.und(anim.from) && !isEqual(anim.from, prevFrom)))
    ) {
      node.setValue((value = from as T))
    }

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

    const onRestQueue = anim.onRest

    // The "onRest" prop is always first in the queue.
    anim.onRest = [get('onRest') || noop, resolve]

    this._reset()

    anim.values = node.getPayload()
    anim.toValues = parent ? null : toArray(goal)
    anim.fromValues = anim.values.map(node => node.lastPosition)
    anim.immediate =
      !(parent || is.num(goal) || is.arr(goal)) ||
      !!matchProp(get('immediate'), this.key)

    // Resolve the promise for unfinished animations.
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

    this._start()
  }

  /** Update the `animation.to` value, which might be a `FluidValue` */
  protected _to(value: T | FluidValue<T>) {
    const anim = this.animation
    if (isFluidValue(anim.to)) {
      if (value == anim.to) return
      anim.to.removeChild(this)
    }
    anim.to = value
    if (isFluidValue(value)) {
      value.addChild(this)
      this.priority = (value.priority || 0) + 1
    } else {
      this.priority = 0
    }
  }

  /** Set the current value and our `node` if necessary. The `_onChange` method is *not* called. */
  protected _set(value: T) {
    if (this.node) {
      const oldValue = this.node.getValue()
      if (isEqual(value, oldValue)) {
        return false
      }
      this.node.setValue(value)
    } else {
      this.setNodeWithValue(value)
    }
    return true
  }

  /** @internal Called by the frameloop */
  public _onChange(value: T, finished = false) {
    const anim = this.animation
    if (anim) {
      if (!anim.changed) {
        anim.changed = true
        // The "onStart" prop is called on the first change after entering the
        // frameloop, but never for immediate animations.
        if (anim.onStart && !anim.immediate) {
          anim.onStart(this)
        }
      }
      if (anim.onChange) {
        anim.onChange(value, this)
      }
    }
    super._onChange(value, finished)
  }

  protected _onPriorityChange(priority: number) {
    if (!this.idle) {
      // Re-enter the frameloop so our new priority is used.
      G.frameLoop.stop(this).start(this)
    }
    super._onPriorityChange(priority)
  }

  /** Reset our node, and the nodes of every descendant spring */
  protected _reset(goal = computeGoal(this.animation.to)) {
    super._reset(goal)
  }

  /** Enter the frameloop */
  protected _start() {
    if (this.idle) {
      this._phase = ACTIVE

      // Animations without "onRest" cannot enter the frameloop.
      const anim = this.animation
      if (anim.onRest) {
        anim.changed = false

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

      const anim = this.animation
      const onRestQueue = anim.onRest

      // Animations without "onRest" never enter the frameloop.
      if (onRestQueue) {
        G.frameLoop.stop(this)
        each(anim.values, node => {
          node.done = true
        })

        // Preserve the "onRest" prop between animations.
        anim.onRest = [onRestQueue[0]]

        // Never call the "onRest" prop for immediate or no-op animations.
        if (anim.immediate || !anim.changed) {
          onRestQueue[0] = noop
        }

        const result = { value: this.get(), spring: this, finished }
        each(onRestQueue, onRest => onRest(result))
      }
    }
  }

  /** Pluck the `to` and `from` props */
  protected _getRange(props: PendingProps<T>): AnimationRange<T> {
    const { to, from } = props as any
    const key = this.key || ''
    return {
      to: !is.obj(to) || isFluidValue(to) ? to : to[key],
      from: !is.obj(from) || isFluidValue(from) ? from : from[key],
    }
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
