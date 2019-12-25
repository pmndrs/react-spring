import {
  is,
  each,
  noop,
  isEqual,
  toArray,
  FluidValue,
  getFluidConfig,
  getFluidValue,
  isAnimatedString,
  Animatable,
} from 'shared'
import {
  AnimatedType,
  AnimatedValue,
  AnimatedString,
  AnimatedArray,
  getPayload,
  getAnimated,
  setAnimated,
} from 'animated'
import * as G from 'shared/globals'

import { Indexable } from './types/common'
import { SpringUpdate } from './types/spring'
import { Animation } from './Animation'
import { mergeConfig } from './AnimationConfig'
import {
  AnimationRange,
  AnimationResult,
  OnRest,
  AnimationEvents,
  EventProp,
  Velocity,
} from './types/animated'
import {
  runAsync,
  scheduleProps,
  AsyncResult,
  RunAsyncState,
  RunAsyncProps,
} from './runAsync'
import { callProp, computeGoal, DEFAULT_PROPS, matchProp } from './helpers'
import { FrameValue, isFrameValue } from './FrameValue'
import {
  SpringPhase,
  CREATED,
  IDLE,
  ACTIVE,
  PAUSED,
  DISPOSED,
} from './SpringPhase'

/** Default props for a `SpringValue` object */
export type DefaultProps<T = unknown> = {
  [D in typeof DEFAULT_PROPS[number]]?: PendingProps<T>[D]
}

/** Pending props for a `SpringValue` object */
export type PendingProps<T = unknown> = unknown &
  SpringUpdate<T> &
  AnimationEvents<T>

declare const console: { warn: Function }

/**
 * Only numbers, strings, and arrays of numbers/strings are supported.
 * Non-animatable strings are also supported.
 */
export class SpringValue<T = any> extends FrameValue<T> {
  /** The property name used when `to` or `from` is an object. Useful when debugging too. */
  key?: string

  /** The animation state */
  animation = new Animation<T>()

  /** The queue of pending props */
  queue?: PendingProps<T>[]

  /** The lifecycle phase of this spring */
  protected _phase: SpringPhase = CREATED

  /** The state for `runAsync` calls */
  protected _state: RunAsyncState<T> = {}

  /** The last time each prop changed */
  protected _timestamps: Indexable<number> = {}

  /** Some props have customizable default values */
  protected _defaultProps = {} as PendingProps<T>

  /** Cancel any update from before this timestamp */
  protected _lastAsyncId = 0

  constructor(from: Exclude<T, object>, props?: PendingProps<T>)
  constructor(props?: PendingProps<T>)
  constructor(arg1?: any, arg2?: any) {
    super()
    if (arguments.length) {
      const props = is.obj(arg1) ? { ...arg1 } : { ...arg2, from: arg1 }
      props.default = true
      this.start(props)
    }
  }

  get idle() {
    return !this.is(ACTIVE) && !this._state.promise
  }

  get goal() {
    return getFluidValue(this.animation.to)
  }

  get velocity() {
    const node = getAnimated(this)!
    return (node instanceof AnimatedValue
      ? node.lastVelocity || 0
      : node.getPayload().map(node => node.lastVelocity || 0)) as Velocity<T>
  }

  /** Advance the current animation by a number of milliseconds */
  advance(dt: number) {
    let idle = true
    let changed = false

    const anim = this.animation
    let { config, toValues } = anim

    const payload = getPayload(anim.to)
    if (!payload) {
      const toConfig = getFluidConfig(anim.to)
      if (toConfig) {
        toValues = toArray(toConfig.get())
      }
    }

    anim.values.forEach((node, i) => {
      if (node.done) return

      // The "anim.toValues" array must exist when no parent exists.
      let to = payload ? payload[i].lastPosition : toValues![i]

      let finished = anim.immediate
      let position = to

      if (!finished) {
        position = node.lastPosition

        // Loose springs never move.
        if (config.tension <= 0) {
          node.done = true
          return
        }

        const elapsed = (node.elapsedTime += dt)
        const from = anim.fromValues[i]

        const v0 =
          node.v0 != null
            ? node.v0
            : (node.v0 = is.arr(config.velocity)
                ? config.velocity[i]
                : config.velocity)

        let velocity: number

        // Duration easing
        if (!is.und(config.duration)) {
          let p = config.progress || 0
          if (config.duration <= 0) p = 1
          else p += (1 - p) * Math.min(1, elapsed / config.duration)

          position = from + config.easing(p) * (to - from)
          velocity = (position - node.lastPosition) / dt

          finished = p == 1
        }

        // Decay easing
        else if (config.decay) {
          const decay = config.decay === true ? 0.998 : config.decay
          const e = Math.exp(-(1 - decay) * elapsed)

          position = from + (v0 / (1 - decay)) * (1 - e)
          // derivative of position
          velocity = v0 * e

          finished = Math.abs(node.lastPosition - position) < 0.1
          if (finished) to = position
        }

        // Spring easing
        else {
          velocity = node.lastVelocity == null ? v0 : node.lastVelocity

          /** The smallest distance from a value before being treated like said value. */
          const precision =
            config.precision ||
            (from == to ? 0.005 : Math.min(1, Math.abs(to - from) * 0.001))

          /** The velocity at which movement is essentially none */
          const restVelocity = config.restVelocity || precision / 10

          // Bouncing is opt-in (not to be confused with overshooting)
          const bounceFactor = config.clamp ? 0 : config.bounce!
          const canBounce = !is.und(bounceFactor)

          /** When `true`, the value is increasing over time */
          const isGrowing = from == to ? node.v0 > 0 : from < to

          /** When `true`, the velocity is considered moving */
          let isMoving!: boolean

          /** When `true`, the velocity is being deflected or clamped */
          let isBouncing = false

          const step = 1 // 1ms
          const numSteps = Math.ceil(dt / step)
          for (let n = 0; n < numSteps; ++n) {
            isMoving = Math.abs(velocity) > restVelocity

            if (!isMoving) {
              finished = Math.abs(to - position) <= precision
              if (finished) {
                break
              }
            }

            if (canBounce) {
              isBouncing = position == to || position > to == isGrowing

              // Invert the velocity with a magnitude, or clamp it.
              if (isBouncing) {
                velocity = -velocity * bounceFactor
                position = to
              }
            }

            const springForce = -config.tension * 0.000001 * (position - to)
            const dampingForce = -config.friction * 0.001 * velocity
            const acceleration = (springForce + dampingForce) / config.mass // pt/ms^2

            velocity = velocity + acceleration * step // pt/ms
            position = position + velocity * step
          }
        }

        node.lastVelocity = velocity

        if (Number.isNaN(position)) {
          console.warn(`Got NaN while animating:`, this)
          finished = true
        }
      }

      // Parent springs must finish before their children can.
      if (payload && !payload[i].done) {
        finished = false
      }

      if (finished) {
        node.done = true
      } else {
        idle = false
      }

      if (node.setValue(position, config.round)) {
        changed = true
      }
    })

    if (idle) {
      this.finish()
    } else if (changed) {
      this._onChange(this.get())
    }
    return idle
  }

  /** Check the current phase */
  is(phase: SpringPhase) {
    return this._phase == phase
  }

  /** Set the current value, while stopping the current animation */
  set(value: T | FluidValue<T>) {
    G.batchedUpdates(() => {
      if (this._set(value) && !this.is(ACTIVE)) {
        // Since "_stop" only calls "_onChange" when not idle, we need this.
        this._onChange(this.get(), true)
      }
      this._stop()
    })
    return this
  }

  /**
   * Freeze the active animation in time.
   * This does nothing when not animating.
   *
   * Call `start` to unpause.
   */
  pause() {
    checkDisposed(this, 'pause')
    this._phase = PAUSED
  }

  /**
   * Skip to the end of the current animation.
   *
   * All `onRest` callbacks are passed `{finished: true}`
   */
  finish(to?: T | FluidValue<T>) {
    if (this.is(ACTIVE)) {
      const anim = this.animation

      // Decay animations have an implicit goal.
      if (!anim.config.decay && is.und(to)) {
        to = anim.to
      }

      // Set the value if we can.
      if (!is.und(to)) {
        this._set(to)
      }

      // Exit the frameloop.
      G.batchedUpdates(() => this._stop(true))
    }
    return this
  }

  /** Push props into the pending queue. */
  update(props: PendingProps<T>) {
    checkDisposed(this, 'update')

    // Ensure the initial value can be accessed by animated components.
    this.setNodeWithProps(props)

    const queue = this.queue || (this.queue = [])
    queue.push(props)
    return this
  }

  /**
   * Update this value's animation using the queue of pending props,
   * and unpause the current animation (if one is frozen).
   *
   * When arguments are passed, a new animation is created, and the
   * queued animations are left alone.
   */
  start(): AsyncResult<T>

  start(props: PendingProps<T>): AsyncResult<T>

  start(to: Animatable<T>, props?: PendingProps<T>): AsyncResult<T>

  async start(to?: PendingProps<T> | Animatable<T>, arg2?: PendingProps<T>) {
    checkDisposed(this, 'start')

    // Unpause if possible.
    if (this.is(PAUSED)) {
      this._start()

      if (this._state.asyncTo) {
        this._state.unpause!()
      }
    }

    let queue: PendingProps<T>[]
    if (!is.und(to)) {
      queue = [is.obj(to) ? (to as any) : { ...arg2, to }]
    } else {
      queue = this.queue || []
      this.queue = []
    }

    const results = await Promise.all(queue.map(props => this._update(props)))
    return {
      value: this.get(),
      finished: results.every(result => result.finished),
      spring: this,
    }
  }

  /**
   * Stop the current animation, and cancel any delayed updates.
   */
  stop() {
    if (!this.is(DISPOSED)) {
      this._state.cancelId = this._lastAsyncId
      this._to(this.get())
      G.batchedUpdates(() => this._stop())
    }
    return this
  }

  /** Restart the animation. */
  reset() {
    this._update({ reset: true })
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

  /** @internal */
  onParentChange(event: FrameValue.Event) {
    super.onParentChange(event)
    if (event.type == 'change') {
      if (!this.is(ACTIVE)) {
        this._reset()
        this._start()
      }
    } else if (event.type == 'priority') {
      this.priority = event.priority + 1
    }
  }

  /**
   * Analyze the given `value` to determine which data type is being animated.
   * Then, create an `Animated` node for that data type and make it our `node`.
   */
  protected _ensureAnimated(value: any) {
    if (value != null) {
      const nodeType = this._getNodeType(value)
      setAnimated(this, nodeType.create(computeGoal(value)))
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
    if (!getAnimated(this)) {
      this._ensureAnimated(range.from != null ? range.from : range.to)
    }
    return range
  }

  /** Return the `Animated` node constructor for a given value */
  protected _getNodeType(value: T | FluidValue<T>): AnimatedType {
    const parentNode = getAnimated(value)
    if (parentNode) {
      const parentType = parentNode.constructor as any
      return parentType == AnimatedString ? AnimatedValue : parentType
    }
    return is.arr(value)
      ? AnimatedArray
      : isAnimatedString(value)
      ? AnimatedString
      : AnimatedValue
  }

  /** Pluck the `to` and `from` props */
  protected _getRange(props: PendingProps<T>): AnimationRange<T> {
    const { to, from } = props as any
    const key = this.key || ''
    return {
      to: !is.obj(to) || getFluidConfig(to) ? to : to[key],
      from: !is.obj(from) || getFluidConfig(from) ? from : from[key],
    }
  }

  /** Schedule an animation to run after an optional delay */
  protected _update(props: PendingProps<T>): AsyncResult<T> {
    // Ensure the initial value can be accessed by animated components.
    const range = this.setNodeWithProps(props)

    const state = this._state
    const timestamp = G.now()
    return scheduleProps(++this._lastAsyncId, {
      key: this.key,
      props,
      state,
      action: (props: RunAsyncProps<T>, resolve) => {
        const { to } = props
        if (is.arr(to) || is.fun(to)) {
          resolve(
            runAsync(
              to,
              props,
              state,
              () => this.get(),
              () => this.is(PAUSED),
              this.start.bind(this),
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
          this._merge(range, props, timestamp, resolve)
        }
      },
    })
  }

  /** Merge props into the current animation */
  protected _merge(
    { to, from }: AnimationRange<T>,
    props: RunAsyncProps<T>,
    timestamp: number,
    resolve: OnRest<T>
  ): void {
    const { key, animation: anim } = this

    const defaultProps = this._defaultProps
    if (props.default) {
      each(DEFAULT_PROPS, prop => {
        // Default props can only be null, an object, or a function.
        if (/function|object/.test(typeof props[prop])) {
          defaultProps[prop] = props[prop] as any
        }
      })
    }

    /** The initial velocity before this `_update` call. */
    const lastVelocity = anim.config.velocity

    if (props.config) {
      mergeConfig(
        anim.config,
        callProp(props.config, key!),
        // Avoid calling the "config" prop twice when "default" is true.
        props.default ? undefined : callProp(defaultProps.config, key!)
      )
    }

    // This instance might not have its Animated node yet. For example,
    // the constructor can be given props without a "to" or "from" value.
    const node = getAnimated(this)
    if (!node) {
      return
    }

    /** Get the value of a prop, or its default value */
    const get = <K extends keyof DefaultProps>(prop: K) =>
      !is.und(props[prop]) ? props[prop] : defaultProps[prop]

    // Every update has a timestamp attached to it (before any delay
    // begins), and some props use their timestamp to know if they
    // were updated before their update finished its delay.
    const timestamps = this._timestamps
    const diff = (prop: string) => {
      if (timestamp >= (timestamps[prop] || 0)) {
        timestamps[prop] = timestamp
        return true
      }
      return false
    }

    const { to: prevTo, from: prevFrom } = anim

    // Use the previous "to" and "from" props if undefined.
    if (is.und(to)) to = prevTo
    if (is.und(from)) from = prevFrom

    // The "reverse" prop only swaps "to" and "from" when "reverse"
    // is defined and its previous value (true/false) is different.
    if (props.reverse) [to, from] = [from, to]

    // Update the "to" and "from" props.
    if (!is.und(to) && diff('to')) this._to(to)
    if (!is.und(from) && diff('from')) anim.from = from

    // These are fluid configs, not animation configs.
    // Fluid configs let us animate from/to dynamic values.
    const toConfig = getFluidConfig(to)
    const fromConfig = getFluidConfig(from)

    if (fromConfig) {
      from = fromConfig.get()
    }

    const reset = props.reset && !is.und(from)
    const changed = !is.und(to) && !isEqual(to, prevTo)

    /** The current value */
    let value = reset ? (from as T) : this.get()
    if (is.und(from)) {
      from = value
    }

    // Ensure our Animated node is compatible with the "to" prop.
    let nodeType: AnimatedType
    if (changed) {
      nodeType = this._getNodeType(to!)
      if (nodeType !== node.constructor) {
        throw Error(
          `Cannot animate to the given "to" prop, because the current value has a different type`
        )
      }
    } else {
      nodeType = node.constructor as any
    }

    // The final value of our animation, excluding the "to" value.
    // Our goal value is dynamic when "toConfig" exists.
    let goal: any = toConfig ? null : computeGoal(to)

    if (nodeType == AnimatedString) {
      from = 0 as any
      goal = 1
    }

    // Ensure the current value equals the "from" value when reset
    // and when the "from" value is updated before the first animation.
    if (
      reset ||
      (this.is(CREATED) && !is.und(anim.from) && !isEqual(anim.from, prevFrom))
    ) {
      node.setValue((value = from as T))
    }

    /** When true, animation is imminent (assuming no interruptions). */
    let started =
      !!toConfig ||
      !!getFluidConfig(prevTo) ||
      ((changed || reset) && !isEqual(value, to))

    const { config } = anim
    if (!started && (config.decay || !is.und(to))) {
      // Start the animation if its velocity is explicitly changed.
      started = !isEqual(config.velocity, lastVelocity)
    }

    const immediate =
      // Sometimes the value is not animatable.
      !(toConfig || is.num(goal) || is.arr(goal)) ||
      !!matchProp(get('immediate'), key)

    if (immediate !== anim.immediate) {
      anim.immediate = immediate
      if (!is.und(to)) {
        started = true
      }
    }

    if (started) {
      anim.values = node.getPayload()
      anim.toValues = toConfig ? null : toArray(goal)
    }

    // Event props are replaced on every update.
    anim.onStart = coerceEventProp(get('onStart'), key)
    anim.onChange = coerceEventProp(get('onChange'), key)

    // By this point, every prop should be merged. (except "onRest")
    const onProps = coerceEventProp(get('onProps'), key)
    if (onProps) {
      onProps(props, this)
    }

    if (!started) {
      return resolve({
        value,
        finished: true,
        spring: this,
      })
    }

    const onRestQueue = anim.onRest || []
    const onRest = coerceEventProp(
      props.onRest || (reset && onRestQueue[0]) || defaultProps.onRest,
      key
    )

    // The "onRest" prop is always first in the queue.
    anim.onRest = [onRest || noop, resolve]

    // Resolve the promises of unfinished animations.
    let onRestIndex = reset ? 0 : 1
    if (onRestIndex < onRestQueue.length) {
      G.batchedUpdates(() => {
        const result: AnimationResult<T> = {
          value,
          spring: this,
          finished: false,
        }
        for (; onRestIndex < onRestQueue.length; onRestIndex++) {
          onRestQueue[onRestIndex](result)
        }
      })
    }

    // Allow for an "onStart" call and "start" event.
    if (reset) {
      this._phase = IDLE
    }

    this._reset()
    this._start()
  }

  /** Update the `animation.to` value, which might be a `FluidValue` */
  protected _to(value: T | FluidValue<T>) {
    const anim = this.animation
    if (value !== anim.to) {
      let config = getFluidConfig(anim.to)
      if (config) {
        config.removeChild(this)
      }

      anim.to = value

      let priority = 0
      if ((config = getFluidConfig(value))) {
        config.addChild(this)
        if (isFrameValue(value)) {
          priority = (value.priority || 0) + 1
        }
      }
      this.priority = priority
    }
  }

  /** Set the current value and our `node` if necessary. The `_onChange` method is *not* called. */
  protected _set(value: T | FluidValue<T>) {
    const config = getFluidConfig(value)
    if (config) {
      value = config.get()
    }

    const node = getAnimated(this)!
    if (node) {
      if (isEqual(value, node.getValue())) {
        return false
      }
      node.setValue(value)
    } else {
      this._ensureAnimated(value)
    }

    return true
  }

  protected _onChange(value: T, idle = false) {
    const anim = this.animation

    // The "onStart" prop is called on the first change after entering the
    // frameloop, but never for immediate animations.
    if (!anim.changed && !idle) {
      anim.changed = true
      if (anim.onStart) {
        anim.onStart(this)
      }
    }

    if (anim.onChange) {
      anim.onChange(value, this)
    }

    super._onChange(value, idle)
  }

  protected _reset() {
    const anim = this.animation

    // Reset the state of each Animated node.
    getAnimated(this)!.reset(computeGoal(anim.to))

    if (!anim.immediate) {
      anim.fromValues = anim.values.map(node => node.lastPosition)
      if (!this.is(ACTIVE)) {
        anim.changed = false
      }
    }

    super._reset()
  }

  protected _start() {
    if (!this.is(ACTIVE)) {
      this._phase = ACTIVE

      super._start()

      // The "skipAnimation" global avoids the frameloop.
      if (G.skipAnimation) {
        this.finish()
      } else {
        G.frameLoop.start(this)
      }
    }
  }

  /**
   * Exit the frameloop and notify `onRest` listeners.
   *
   * Always wrap `_stop` calls with `batchedUpdates`.
   */
  protected _stop(finished = false) {
    if (this.is(ACTIVE)) {
      this._phase = IDLE

      // Always let change observers know when a spring becomes idle.
      this._onChange(this.get(), true)

      const anim = this.animation
      each(anim.values, node => {
        node.done = true
      })

      // The "onRest" queue won't exist when we're being disposed.
      const onRestQueue = anim.onRest
      if (onRestQueue) {
        // Preserve the "onRest" prop when the goal is dynamic.
        anim.onRest = [anim.toValues ? noop : onRestQueue[0]]

        // Never call the "onRest" prop for immediate or no-op animations.
        if (anim.immediate || !anim.changed) {
          onRestQueue[0] = noop
        }

        const result = { value: this.get(), spring: this, finished }
        each(onRestQueue, onRest => {
          onRest(result)
        })
      }
    }
  }
}

// TODO: makes this tree-shakeable
function checkDisposed(spring: SpringValue, name: string) {
  if (spring.is(DISPOSED)) {
    throw Error(
      `Cannot call "${name}" of disposed "${spring.constructor.name}" object`
    )
  }
}

/** Coerce an event prop to an event handler */
function coerceEventProp<T extends Function>(
  prop: EventProp<T> | undefined,
  key: string | undefined
) {
  return is.fun(prop) ? prop : key && prop ? prop[key] : undefined
}
