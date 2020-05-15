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
  flushCalls,
} from 'shared'
import {
  AnimatedType,
  AnimatedValue,
  AnimatedString,
  AnimatedArray,
  getPayload,
  getAnimated,
  setAnimated,
  Animated,
} from 'animated'
import * as G from 'shared/globals'

import { Animation } from './Animation'
import { mergeConfig } from './AnimationConfig'
import { scheduleProps } from './scheduleProps'
import { runAsync, RunAsyncState, RunAsyncProps, stopAsync } from './runAsync'
import {
  callProp,
  computeGoal,
  matchProp,
  inferTo,
  mergeDefaultProps,
  getDefaultProps,
  getDefaultProp,
  throwDisposed,
  overrideGet,
} from './helpers'
import { FrameValue, isFrameValue } from './FrameValue'
import {
  SpringPhase,
  CREATED,
  IDLE,
  ACTIVE,
  PAUSED,
  DISPOSED,
} from './SpringPhase'
import {
  AnimationRange,
  OnRest,
  SpringDefaultProps,
  SpringUpdate,
  VelocityProp,
  AnimationResolver,
  SpringEventProps,
} from './types'
import {
  AsyncResult,
  getCombinedResult,
  getCancelledResult,
  getFinishedResult,
  getNoopResult,
} from './AnimationResult'

declare const console: any

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
  queue?: SpringUpdate<T>[]

  /** The lifecycle phase of this spring */
  protected _phase: SpringPhase = CREATED

  /** The state for `runAsync` calls */
  protected _state: RunAsyncState<T> = {
    pauseQueue: new Set(),
    resumeQueue: new Set(),
  }

  /** Some props have customizable default values */
  protected _defaultProps = {} as SpringDefaultProps<T>

  /** The counter for tracking `scheduleProps` calls */
  protected _lastCallId = 0

  /** The last `scheduleProps` call that changed the `to` prop */
  protected _lastToId = 0

  constructor(from: Exclude<T, object>, props?: SpringUpdate<T>)
  constructor(props?: SpringUpdate<T>)
  constructor(arg1?: any, arg2?: any) {
    super()
    if (!is.und(arg1) || !is.und(arg2)) {
      const props = is.obj(arg1) ? { ...arg1 } : { ...arg2, from: arg1 }
      props.default = true
      this.start(props)
    }
  }

  get idle() {
    return !this.is(ACTIVE) && !this._state.asyncTo
  }

  get goal() {
    return getFluidValue(this.animation.to)
  }

  get velocity(): VelocityProp<T> {
    const node = getAnimated(this)!
    return (node instanceof AnimatedValue
      ? node.lastVelocity || 0
      : node.getPayload().map(node => node.lastVelocity || 0)) as any
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
          finished = Math.abs(node.lastPosition - position) < 0.1

          // derivative of position
          velocity = v0 * e
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
      this._focus(value)
      if (this._set(value)) {
        // Ensure change observers are notified. When active,
        // the "_stop" method handles this.
        if (!this.is(ACTIVE)) {
          return this._onChange(this.get(), true)
        }
      }
      this._stop()
    })
    return this
  }

  /**
   * Freeze the active animation in time.
   * This does nothing when not animating.
   */
  pause() {
    throwDisposed(this.is(DISPOSED))
    if (!this.is(PAUSED)) {
      this._phase = PAUSED
      flushCalls(this._state.pauseQueue)
      callProp(this.animation.onPause, this)
    }
  }

  /** Resume the animation if paused. */
  resume() {
    throwDisposed(this.is(DISPOSED))
    if (this.is(PAUSED)) {
      this._start()
      flushCalls(this._state.resumeQueue)
      callProp(this.animation.onResume, this)
    }
  }

  /**
   * Skip to the end of the current animation.
   *
   * All `onRest` callbacks are passed `{finished: true}`
   */
  finish(to?: T | FluidValue<T>) {
    if (this.is(ACTIVE) || this.is(PAUSED)) {
      const anim = this.animation

      // Decay animations have an implicit goal.
      if (!anim.config.decay && is.und(to)) {
        to = anim.to
      }

      // Set the value if we can.
      if (!is.und(to)) {
        this._set(to)
      }

      G.batchedUpdates(() => {
        // Ensure the "onStart" and "onRest" props are called.
        this._onStart()
        // Exit the frameloop.
        this._stop()
      })
    }
    return this
  }

  /** Push props into the pending queue. */
  update(props: SpringUpdate<T>) {
    throwDisposed(this.is(DISPOSED))
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

  start(props: SpringUpdate<T>): AsyncResult<T>

  start(to: Animatable<T>, props?: SpringUpdate<T>): AsyncResult<T>

  start(to?: SpringUpdate<T> | Animatable<T>, arg2?: SpringUpdate<T>) {
    throwDisposed(this.is(DISPOSED))

    let queue: SpringUpdate<T>[]
    if (!is.und(to)) {
      queue = [is.obj(to) ? (to as any) : { ...arg2, to }]
    } else {
      queue = this.queue || []
      this.queue = []
    }

    return Promise.all(queue.map(props => this._update(props))).then(results =>
      getCombinedResult(this, results)
    )
  }

  /**
   * Stop the current animation, and cancel any delayed updates.
   *
   * Pass `true` to call `onRest` with `cancelled: true`.
   */
  stop(cancel?: boolean) {
    if (!this.is(DISPOSED)) {
      stopAsync(this._state, cancel && this._lastCallId)

      // Ensure the `to` value equals the current value.
      this._focus(this.get())

      // Exit the frameloop and notify `onRest` listeners.
      G.batchedUpdates(() => this._stop(cancel))
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
        this.animation.onRest = []
      }
      this.stop()
      this._phase = DISPOSED
      overrideGet(this, 'animation', throwDisposed)
    }
  }

  /** @internal */
  onParentChange(event: FrameValue.Event) {
    super.onParentChange(event)
    if (event.type == 'change') {
      if (!this.is(ACTIVE)) {
        this._reset()
        if (!this.is(PAUSED)) {
          this._start()
        }
      }
    } else if (event.type == 'priority') {
      this.priority = event.priority + 1
    }
  }

  /**
   * Parse the `to` and `from` range from the given `props` object.
   *
   * This also ensures the initial value is available to animated components
   * during the render phase.
   */
  protected _prepareNode({
    to,
    from,
    reverse,
  }: {
    to?: any
    from?: any
    reverse?: boolean
  }) {
    const key = this.key || ''

    to = !is.obj(to) || getFluidConfig(to) ? to : to[key]
    from = !is.obj(from) || getFluidConfig(from) ? from : from[key]

    // Create the range now to avoid "reverse" logic.
    const range = { to, from }

    // Before ever animating, this method ensures an `Animated` node
    // exists and keeps its value in sync with the "from" prop.
    if (this.is(CREATED)) {
      if (reverse) [to, from] = [from, to]
      from = getFluidValue(from)

      const node = this._updateNode(is.und(from) ? getFluidValue(to) : from)
      if (node && !is.und(from)) {
        node.setValue(from)
      }
    }

    return range
  }

  /**
   * Create an `Animated` node if none exists or the given value has an
   * incompatible type. Do nothing if `value` is undefined.
   *
   * The newest `Animated` node is returned.
   */
  protected _updateNode(value: any): Animated | undefined {
    let node = getAnimated(this)
    if (!is.und(value)) {
      const nodeType = this._getNodeType(value)
      if (!node || node.constructor !== nodeType) {
        setAnimated(this, (node = nodeType.create(value)))
      }
    }
    return node
  }

  /** Return the `Animated` node constructor for a given value */
  protected _getNodeType(value: T | FluidValue<T>): AnimatedType {
    const parentNode = getAnimated(value)
    return parentNode
      ? (parentNode.constructor as any)
      : is.arr(value)
      ? AnimatedArray
      : isAnimatedString(value)
      ? AnimatedString
      : AnimatedValue
  }

  /** Every update is processed by this method before merging. */
  protected _update(
    { ...props }: SpringUpdate<T>,
    isLoop?: boolean
  ): AsyncResult<T> {
    const defaultProps: any = this._defaultProps

    // Let the caller inspect every update.
    const onProps = resolveEventProp(defaultProps, props, 'onProps', this.key)
    if (onProps) {
      onProps(props, this)
    }

    // These props are coerced into booleans by the `scheduleProps` function,
    // so they need their default values merged before then.
    each(['cancel', 'pause'] as const, key => {
      const value = getDefaultProp(props, key)
      if (!is.und(value)) {
        defaultProps[key] = value as any
      }
      // For these props, truthy default values are preferred.
      if (defaultProps[key]) {
        props[key] = defaultProps[key] as any
      }
    })

    // Ensure the initial value can be accessed by animated components.
    const range = this._prepareNode(props)

    return scheduleProps<T>(++this._lastCallId, {
      key: this.key,
      props,
      state: this._state,
      actions: {
        pause: this.pause.bind(this),
        resume: this.resume.bind(this),
        start: this._merge.bind(this, range),
      },
    }).then(result => {
      if (props.loop && result.finished && !(isLoop && result.noop)) {
        const nextProps = createLoopUpdate(props)
        if (nextProps) {
          return this._update(nextProps, true)
        }
      }
      return result
    })
  }

  /** Merge props into the current animation */
  protected _merge(
    range: AnimationRange<T>,
    props: RunAsyncProps<T>,
    resolve: AnimationResolver<T>
  ): void {
    // The "cancel" prop cancels all pending delays and it forces the
    // active animation to stop where it is.
    if (props.cancel) {
      this.stop(true)
      return resolve(getCancelledResult(this))
    }

    const { key, animation: anim } = this
    const defaultProps = this._defaultProps

    /** The "to" prop is defined. */
    const hasToProp = !is.und(range.to)

    /** The "from" prop is defined. */
    const hasFromProp = !is.und(range.from)

    // Avoid merging other props if implicitly prevented, except
    // when both the "to" and "from" props are undefined.
    if (hasToProp || hasFromProp) {
      if (props.callId > this._lastToId) {
        this._lastToId = props.callId
      } else {
        return resolve(getCancelledResult(this))
      }
    }

    /** Get the function for a specific event prop */
    const getEventProp = <K extends keyof SpringEventProps>(prop: K) =>
      resolveEventProp(defaultProps, props, prop, key)

    // Call "onDelayEnd" before merging props, but after cancellation checks.
    const onDelayEnd = getEventProp('onDelayEnd')
    if (onDelayEnd) {
      onDelayEnd(props, this)
    }

    if (props.default) {
      mergeDefaultProps(defaultProps, props, ['pause', 'cancel'])
    }

    const { to: prevTo, from: prevFrom } = anim
    let { to = prevTo, from = prevFrom } = range

    // Focus the "from" value if changing without a "to" value.
    if (hasFromProp && !hasToProp) {
      to = from
    }

    // Flip the current range if "reverse" is true.
    if (props.reverse) [to, from] = [from, to]

    /** The "from" value is changing. */
    const hasFromChanged = !isEqual(from, prevFrom)

    if (hasFromChanged) {
      anim.from = from
    }

    /** The "to" value is changing. */
    const hasToChanged = !isEqual(to, prevTo)

    if (hasToChanged) {
      this._focus(to)
    }

    // Both "from" and "to" can use a fluid config (thanks to http://npmjs.org/fluids).
    const toConfig = getFluidConfig(to)
    const fromConfig = getFluidConfig(from)

    if (fromConfig) {
      from = fromConfig.get()
    }

    /** The "to" prop is async. */
    const hasAsyncTo = is.arr(props.to) || is.fun(props.to)

    const { config } = anim
    const { decay, velocity } = config

    // The "runAsync" function treats the "config" prop as a default,
    // so we must avoid merging it when the "to" prop is async.
    if (props.config && !hasAsyncTo) {
      mergeConfig(
        config,
        callProp(props.config, key!),
        // Avoid calling the same "config" prop twice.
        props.config !== defaultProps.config
          ? callProp(defaultProps.config, key!)
          : void 0
      )
    }

    // This instance might not have its Animated node yet. For example,
    // the constructor can be given props without a "to" or "from" value.
    let node = getAnimated(this)
    if (!node || is.und(to)) {
      return resolve(getFinishedResult(this, true))
    }

    /** When true, start at the "from" value. */
    const reset =
      // When `reset` is undefined, the `from` prop implies `reset: true`,
      // except for declarative updates. When `reset` is defined, there
      // must exist a value to animate from.
      is.und(props.reset)
        ? hasFromProp && !props.default
        : !is.und(from) && matchProp(props.reset, key)

    // The current value, where the animation starts from.
    const value = reset ? (from as T) : this.get()

    // The animation ends at this value, unless "to" is fluid.
    const goal = computeGoal<any>(to)

    // Only specific types can be animated to/from.
    const isAnimatable = is.num(goal) || is.arr(goal) || isAnimatedString(goal)

    // When true, the value changes instantly on the next frame.
    const immediate =
      !hasAsyncTo &&
      (!isAnimatable ||
        matchProp(defaultProps.immediate || props.immediate, key))

    if (hasToChanged) {
      if (immediate) {
        node = this._updateNode(goal)!
      } else {
        const nodeType = this._getNodeType(to)
        if (nodeType !== node.constructor) {
          throw Error(
            `Cannot animate between ${node.constructor.name} and ${nodeType.name}, as the "to" prop suggests`
          )
        }
      }
    }

    // The type of Animated node for the goal value.
    const goalType = node.constructor

    // When the goal value is fluid, we don't know if its value
    // will change before the next animation frame, so it always
    // starts the animation to be safe.
    let started = !!toConfig
    let finished = false

    if (!started) {
      // When true, the current value has probably changed.
      const hasValueChanged = reset || (this.is(CREATED) && hasFromChanged)

      // When the "to" value or current value are changed,
      // start animating if not already finished.
      if (hasToChanged || hasValueChanged) {
        finished = isEqual(computeGoal(value), goal)
        started = !finished
      }

      // Changing "decay" or "velocity" starts the animation.
      if (
        !isEqual(config.decay, decay) ||
        !isEqual(config.velocity, velocity)
      ) {
        started = true
      }
    }

    // When an active animation changes its goal to its current value:
    if (finished && this.is(ACTIVE)) {
      // Avoid an abrupt stop unless the animation is being reset.
      if (anim.changed && !reset) {
        started = true
      }
      // Stop the animation before its first frame.
      else if (!started) {
        this._stop()
      }
    }

    if (!hasAsyncTo) {
      anim.immediate = immediate

      // Make sure our "toValues" are updated even if our previous
      // "to" prop is a fluid value whose current value is also ours.
      if (started || getFluidConfig(prevTo)) {
        anim.values = node.getPayload()
        anim.toValues = toConfig
          ? null
          : goalType == AnimatedString
          ? [1]
          : toArray(goal)
      }

      // These event props are saved for later.
      each(
        ['onStart', 'onChange', 'onPause', 'onResume'] as const,
        prop => (anim[prop] = getEventProp(prop) as any)
      )

      // The "reset" prop tries to reuse the old "onRest" prop,
      // unless you defined a new "onRest" prop.
      const onRestQueue = anim.onRest
      const onRest =
        reset && !props.onRest
          ? onRestQueue[0] || noop
          : checkFinishedOnRest(getEventProp('onRest'), this)

      // In most cases, the animation after this one won't reuse our
      // "onRest" prop. Instead, the _default_ "onRest" prop is used
      // when the next animation has an undefined "onRest" prop.
      if (started) {
        anim.onRest = [onRest, checkFinishedOnRest(resolve, this)]

        // Flush the "onRest" queue for the previous animation.
        let onRestIndex = reset ? 0 : 1
        if (onRestIndex < onRestQueue.length) {
          G.batchedUpdates(() => {
            for (; onRestIndex < onRestQueue.length; onRestIndex++) {
              onRestQueue[onRestIndex]()
            }
          })
        }
      }
      // The "onRest" prop is always first, and it can be updated even
      // if a new animation is not started by this update.
      else if (reset || props.onRest) {
        anim.onRest[0] = onRest
      }
    }

    // Update our node even if the animation is idle.
    if (reset) {
      node.setValue(value)
    }

    if (hasAsyncTo) {
      resolve(runAsync(props.to, props, this._state, this))
    }

    // Start an animation
    else if (started) {
      // Must be idle for "onStart" to be called again.
      if (reset) this._phase = IDLE

      this._reset()
      this._start()
    }

    // Postpone promise resolution until the animation is finished,
    // so that no-op updates still resolve at the expected time.
    else if (this.is(ACTIVE) && !hasToChanged) {
      anim.onRest.push(checkFinishedOnRest(resolve, this))
    }

    // Resolve our promise immediately.
    else {
      resolve(getNoopResult(this, value))
    }
  }

  /** Update the `animation.to` value, which might be a `FluidValue` */
  protected _focus(value: T | FluidValue<T>) {
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
    const node = getAnimated(this)
    const oldValue = node && node.getValue()
    if (node) {
      node.setValue(value)
    } else {
      this._updateNode(value)
    }
    return !isEqual(value, oldValue)
  }

  protected _onStart() {
    const anim = this.animation
    if (!anim.changed) {
      anim.changed = true
      callProp(anim.onStart, this)
    }
  }

  protected _onChange(value: T, idle = false) {
    const anim = this.animation

    // The "onStart" prop is called on the first change after entering the
    // frameloop, but never for immediate animations.
    if (!idle) {
      this._onStart()
    }

    callProp(anim.onChange, value, this)
    super._onChange(value, idle)
  }

  protected _reset() {
    const anim = this.animation

    // Reset the state of each Animated node.
    getAnimated(this)!.reset(anim.to)

    // Ensure the `onStart` prop will be called.
    if (!this.is(ACTIVE)) {
      anim.changed = false
    }

    // Use the current values as the from values.
    if (!anim.immediate) {
      anim.fromValues = anim.values.map(node => node.lastPosition)
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
  protected _stop(cancel?: boolean) {
    if (this.is(ACTIVE) || this.is(PAUSED)) {
      this._phase = IDLE

      // Always let change observers know when a spring becomes idle.
      this._onChange(this.get(), true)

      const anim = this.animation
      each(anim.values, node => {
        node.done = true
      })

      const onRestQueue = anim.onRest
      if (onRestQueue.length) {
        // Preserve the "onRest" prop when the goal is dynamic.
        anim.onRest = [anim.toValues ? noop : onRestQueue[0]]

        // Never call the "onRest" prop for no-op animations.
        if (!anim.changed) {
          onRestQueue[0] = noop
        }

        each(onRestQueue, onRest => onRest(cancel))
      }
    }
  }
}

/**
 * The "finished" value is determined by each "onRest" handler,
 * based on whether the current value equals the goal value that
 * was calculated at the time the "onRest" handler was set.
 */
const checkFinishedOnRest = <T>(
  onRest: OnRest<T> | undefined,
  spring: SpringValue<T>
) => {
  const { to } = spring.animation
  return onRest
    ? (cancel?: boolean) => {
        if (cancel) {
          onRest(getCancelledResult(spring))
        } else {
          const goal = computeGoal(to)
          const value = computeGoal(spring.get())
          const finished = isEqual(value, goal)
          onRest(getFinishedResult(spring, finished))
        }
      }
    : noop
}

export function createLoopUpdate<T>(
  props: T & { loop?: any; to?: any; from?: any; reverse?: any },
  loop = props.loop,
  to = props.to
): T | undefined {
  let loopRet = callProp(loop)
  if (loopRet) {
    const overrides = loopRet !== true && inferTo(loopRet)
    const reverse = (overrides || props).reverse
    const reset = !overrides || overrides.reset
    return createUpdate({
      ...props,
      loop,

      // Avoid updating default props when looping.
      default: false,

      // For the "reverse" prop to loop as expected, the "to" prop
      // must be undefined. The "reverse" prop is ignored when the
      // "to" prop is an array or function.
      to: !reverse || is.arr(to) || is.fun(to) ? to : undefined,

      // Avoid defining the "from" prop if a reset is unwanted.
      from: reset ? props.from : undefined,
      reset,

      // The "loop" prop can return a "useSpring" props object to
      // override any of the original props.
      ...overrides,
    })
  }
}

/**
 * Return a new object based on the given `props`.
 *
 * - All unreserved props are moved into the `to` prop object.
 * - The `to` and `from` props are deleted when falsy.
 * - The `keys` prop is set to an array of affected keys,
 *   or `null` if all keys are affected.
 */
export function createUpdate(props: any) {
  const { to, from } = (props = inferTo(props))

  // Collect the keys affected by this update.
  const keys = new Set<string>()

  if (from) {
    findDefined(from, keys)
  } else {
    // Falsy values are deleted to avoid merging issues.
    delete props.from
  }

  if (is.obj(to)) {
    findDefined(to, keys)
  } else if (!to) {
    // Falsy values are deleted to avoid merging issues.
    delete props.to
  }

  // The "keys" prop helps in applying updates to affected keys only.
  props.keys = keys.size ? Array.from(keys) : null

  return props
}

/**
 * A modified version of `createUpdate` meant for declarative APIs.
 */
export function declareUpdate(props: any) {
  const update = createUpdate(props)
  if (is.und(update.default)) {
    update.default = getDefaultProps(update, [
      // Avoid forcing `immediate: true` onto imperative updates.
      update.immediate === true && 'immediate',
    ])
  }
  return update
}

/** Find keys with defined values */
function findDefined(values: any, keys: Set<string>) {
  each(values, (value, key) => value != null && keys.add(key as any))
}

/** Coerce an event prop into a function */
function resolveEventProp<T extends SpringEventProps, P extends keyof T>(
  defaultProps: T,
  props: T,
  prop: P,
  key?: string
): Extract<T[P], Function> {
  const value: any = !is.und(props[prop]) ? props[prop] : defaultProps[prop]
  return is.fun(value) ? value : key && value ? value[key] : undefined
}
