import {
  is,
  raf,
  each,
  isEqual,
  toArray,
  eachProp,
  frameLoop,
  flushCalls,
  getFluidValue,
  isAnimatedString,
  FluidValue,
  Globals as G,
  callFluidObservers,
  hasFluidValue,
  addFluidObserver,
  removeFluidObserver,
  getFluidObservers,
} from '@react-spring/shared'
import {
  Animated,
  AnimatedValue,
  AnimatedString,
  getPayload,
  getAnimated,
  setAnimated,
  getAnimatedType,
} from '@react-spring/animated'
import { Lookup } from '@react-spring/types'

import { Animation } from './Animation'
import { mergeConfig } from './AnimationConfig'
import { scheduleProps } from './scheduleProps'
import { runAsync, RunAsyncState, RunAsyncProps, stopAsync } from './runAsync'
import {
  callProp,
  computeGoal,
  matchProp,
  inferTo,
  getDefaultProps,
  getDefaultProp,
  isAsyncTo,
  resolveProp,
} from './helpers'
import { FrameValue, isFrameValue } from './FrameValue'
import {
  isAnimating,
  isPaused,
  setPausedBit,
  hasAnimated,
  setActiveBit,
} from './SpringPhase'
import {
  AnimationRange,
  AnimationResolver,
  EventKey,
  PickEventFns,
} from './types/internal'
import { AsyncResult, SpringUpdate, VelocityProp, SpringProps } from './types'
import {
  getCombinedResult,
  getCancelledResult,
  getFinishedResult,
  getNoopResult,
} from './AnimationResult'

declare const console: any

interface DefaultSpringProps<T>
  extends Pick<SpringProps<T>, 'pause' | 'cancel' | 'immediate' | 'config'>,
    PickEventFns<SpringProps<T>> {}

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

  /** Some props have customizable default values */
  defaultProps: DefaultSpringProps<T> = {}

  /** The state for `runAsync` calls */
  protected _state: RunAsyncState<SpringValue<T>> = {
    paused: false,
    pauseQueue: new Set(),
    resumeQueue: new Set(),
    timeouts: new Set(),
  }

  /** The promise resolvers of pending `start` calls */
  protected _pendingCalls = new Set<AnimationResolver<this>>()

  /** The counter for tracking `scheduleProps` calls */
  protected _lastCallId = 0

  /** The last `scheduleProps` call that changed the `to` prop */
  protected _lastToId = 0

  protected _memoizedDuration = 0

  constructor(from: Exclude<T, object>, props?: SpringUpdate<T>)
  constructor(props?: SpringUpdate<T>)
  constructor(arg1?: any, arg2?: any) {
    super()
    if (!is.und(arg1) || !is.und(arg2)) {
      const props = is.obj(arg1) ? { ...arg1 } : { ...arg2, from: arg1 }
      if (is.und(props.default)) {
        props.default = true
      }
      this.start(props)
    }
  }

  /** Equals true when not advancing on each frame. */
  get idle() {
    return !(isAnimating(this) || this._state.asyncTo) || isPaused(this)
  }

  get goal() {
    return getFluidValue(this.animation.to) as T
  }

  get velocity(): VelocityProp<T> {
    const node = getAnimated(this)!
    return (node instanceof AnimatedValue
      ? node.lastVelocity || 0
      : node.getPayload().map(node => node.lastVelocity || 0)) as any
  }

  /**
   * When true, this value has been animated at least once.
   */
  get hasAnimated() {
    return hasAnimated(this)
  }

  /**
   * When true, this value has an unfinished animation,
   * which is either active or paused.
   */
  get isAnimating() {
    return isAnimating(this)
  }

  /**
   * When true, all current and future animations are paused.
   */
  get isPaused() {
    return isPaused(this)
  }

  /** Advance the current animation by a number of milliseconds */
  advance(dt: number) {
    let idle = true
    let changed = false

    const anim = this.animation
    let { config, toValues } = anim

    const payload = getPayload(anim.to)
    if (!payload && hasFluidValue(anim.to)) {
      toValues = toArray(getFluidValue(anim.to)) as any
    }

    anim.values.forEach((node, i) => {
      if (node.done) return

      const to =
        // Animated strings always go from 0 to 1.
        node.constructor == AnimatedString
          ? 1
          : payload
          ? payload[i].lastPosition
          : toValues![i]

      let finished = anim.immediate
      let position = to

      if (!finished) {
        position = node.lastPosition

        // Loose springs never move.
        if (config.tension <= 0) {
          node.done = true
          return
        }

        let elapsed = (node.elapsedTime += dt)
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
          let p = 1
          if (config.duration > 0) {
            /**
             * Here we check if the duration has changed in the config
             * and if so update the elapsed time to the percentage
             * of completition so there is no jank in the animation
             * https://github.com/pmndrs/react-spring/issues/1163
             */
            if (this._memoizedDuration !== config.duration) {
              // update the memoized version to the new duration
              this._memoizedDuration = config.duration

              // if the value has started animating we need to update it
              if (node.durationProgress > 0) {
                // set elapsed time to be the same percentage of progress as the previous duration
                node.elapsedTime = config.duration * node.durationProgress
                // add the delta so the below updates work as expected
                elapsed = node.elapsedTime += dt
              }
            }

            // calculate the new progress
            p = (config.progress || 0) + elapsed / this._memoizedDuration
            // p is clamped between 0-1
            p = p > 1 ? 1 : p < 0 ? 0 : p
            // store our new progress
            node.durationProgress = p
          }

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

    const node = getAnimated(this)!
    if (idle) {
      const value = getFluidValue(anim.to)
      if (node.setValue(value) || changed) {
        this._onChange(value)
      }
      this._stop()
    } else if (changed) {
      this._onChange(node.getValue())
    }
  }

  /** Set the current value, while stopping the current animation */
  set(value: T | FluidValue<T>) {
    raf.batchedUpdates(() => {
      this._stop()

      // These override the current value and goal value that may have
      // been updated by `onRest` handlers in the `_stop` call above.
      this._focus(value)
      this._set(value)
    })
    return this
  }

  /**
   * Freeze the active animation in time, as well as any updates merged
   * before `resume` is called.
   */
  pause() {
    this._update({ pause: true })
  }

  /** Resume the animation if paused. */
  resume() {
    this._update({ pause: false })
  }

  /** Skip to the end of the current animation. */
  finish() {
    if (isAnimating(this)) {
      const { to, config } = this.animation
      raf.batchedUpdates(() => {
        // Ensure the "onStart" and "onRest" props are called.
        this._onStart()

        // Jump to the goal value, except for decay animations
        // which have an undefined goal value.
        if (!config.decay) {
          this._set(to, false)
        }

        this._stop()
      })
    }
    return this
  }

  /** Push props into the pending queue. */
  update(props: SpringUpdate<T>) {
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
  start(): AsyncResult<this>

  start(props: SpringUpdate<T>): AsyncResult<this>

  start(to: T, props?: SpringProps<T>): AsyncResult<this>

  start(to?: T | SpringUpdate<T>, arg2?: SpringProps<T>) {
    let queue: SpringUpdate<T>[]
    if (!is.und(to)) {
      queue = [is.obj(to) ? to : { ...arg2, to }]
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
    const { to } = this.animation

    // The current value becomes the goal value.
    this._focus(this.get())

    stopAsync(this._state, cancel && this._lastCallId)
    raf.batchedUpdates(() => this._stop(to, cancel))

    return this
  }

  /** Restart the animation. */
  reset() {
    this._update({ reset: true })
  }

  /** @internal */
  eventObserved(event: FrameValue.Event) {
    if (event.type == 'change') {
      this._start()
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
  protected _prepareNode(props: {
    to?: any
    from?: any
    reverse?: boolean
    default?: any
  }) {
    const key = this.key || ''

    let { to, from } = props

    to = is.obj(to) ? to[key] : to
    if (to == null || isAsyncTo(to)) {
      to = undefined
    }

    from = is.obj(from) ? from[key] : from
    if (from == null) {
      from = undefined
    }

    // Create the range now to avoid "reverse" logic.
    const range = { to, from }

    // Before ever animating, this method ensures an `Animated` node
    // exists and keeps its value in sync with the "from" prop.
    if (!hasAnimated(this)) {
      if (props.reverse) [to, from] = [from, to]

      from = getFluidValue(from)
      if (!is.und(from)) {
        this._set(from)
      }
      // Use the "to" value if our node is undefined.
      else if (!getAnimated(this)) {
        this._set(to)
      }
    }

    return range
  }

  /** Every update is processed by this method before merging. */
  protected _update(
    { ...props }: SpringProps<T>,
    isLoop?: boolean
  ): AsyncResult<SpringValue<T>> {
    const { key, defaultProps } = this

    // Update the default props immediately.
    if (props.default)
      Object.assign(
        defaultProps,
        getDefaultProps(props, (value, prop) =>
          /^on/.test(prop) ? resolveProp(value, key) : value
        )
      )

    mergeActiveFn(this, props, 'onProps')
    sendEvent(this, 'onProps', props, this)

    // Ensure the initial value can be accessed by animated components.
    const range = this._prepareNode(props)

    if (Object.isFrozen(this)) {
      throw Error(
        'Cannot animate a `SpringValue` object that is frozen. ' +
          'Did you forget to pass your component to `animated(...)` before animating its props?'
      )
    }

    const state = this._state
    return scheduleProps(++this._lastCallId, {
      key,
      props,
      defaultProps,
      state,
      actions: {
        pause: () => {
          if (!isPaused(this)) {
            setPausedBit(this, true)
            flushCalls(state.pauseQueue)
            sendEvent(
              this,
              'onPause',
              getFinishedResult(this, checkFinished(this, this.animation.to)),
              this
            )
          }
        },
        resume: () => {
          if (isPaused(this)) {
            setPausedBit(this, false)
            if (isAnimating(this)) {
              this._resume()
            }
            flushCalls(state.resumeQueue)
            sendEvent(
              this,
              'onResume',
              getFinishedResult(this, checkFinished(this, this.animation.to)),
              this
            )
          }
        },
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
    props: RunAsyncProps<SpringValue<T>>,
    resolve: AnimationResolver<SpringValue<T>>
  ): void {
    // The "cancel" prop cancels all pending delays and it forces the
    // active animation to stop where it is.
    if (props.cancel) {
      this.stop(true)
      return resolve(getCancelledResult(this))
    }

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

    const { key, defaultProps, animation: anim } = this
    const { to: prevTo, from: prevFrom } = anim
    let { to = prevTo, from = prevFrom } = range

    // Focus the "from" value if changing without a "to" value.
    // For default updates, do this only if no "to" value exists.
    if (hasFromProp && !hasToProp && (!props.default || is.und(to))) {
      to = from
    }

    // Flip the current range if "reverse" is true.
    if (props.reverse) [to, from] = [from, to]

    /** The "from" value is changing. */
    const hasFromChanged = !isEqual(from, prevFrom)

    if (hasFromChanged) {
      anim.from = from
    }

    // Coerce "from" into a static value.
    from = getFluidValue(from)

    /** The "to" value is changing. */
    const hasToChanged = !isEqual(to, prevTo)

    if (hasToChanged) {
      this._focus(to)
    }

    /** The "to" prop is async. */
    const hasAsyncTo = isAsyncTo(props.to)

    const { config } = anim
    const { decay, velocity } = config

    // Reset to default velocity when goal values are defined.
    if (hasToProp || hasFromProp) {
      config.velocity = 0
    }

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
      const nodeType = getAnimatedType(to)
      if (nodeType !== node.constructor) {
        if (immediate) {
          node = this._set(goal)!
        } else
          throw Error(
            `Cannot animate between ${node.constructor.name} and ${nodeType.name}, as the "to" prop suggests`
          )
      }
    }

    // The type of Animated node for the goal value.
    const goalType = node.constructor

    // When the goal value is fluid, we don't know if its value
    // will change before the next animation frame, so it always
    // starts the animation to be safe.
    let started = hasFluidValue(to)
    let finished = false

    if (!started) {
      // When true, the current value has probably changed.
      const hasValueChanged = reset || (!hasAnimated(this) && hasFromChanged)

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

    // Was the goal value set to the current value while animating?
    if (finished && isAnimating(this)) {
      // If the first frame has passed, allow the animation to
      // overshoot instead of stopping abruptly.
      if (anim.changed && !reset) {
        started = true
      }
      // Stop the animation before its first frame.
      else if (!started) {
        this._stop(prevTo)
      }
    }

    if (!hasAsyncTo) {
      // Make sure our "toValues" are updated even if our previous
      // "to" prop is a fluid value whose current value is also ours.
      if (started || hasFluidValue(prevTo)) {
        anim.values = node.getPayload()
        anim.toValues = hasFluidValue(to)
          ? null
          : goalType == AnimatedString
          ? [1]
          : toArray(goal)
      }

      if (anim.immediate != immediate) {
        anim.immediate = immediate

        // Ensure the immediate goal is used as from value.
        if (!immediate && !reset) {
          this._set(prevTo)
        }
      }

      if (started) {
        const { onRest } = anim

        // Set the active handlers when an animation starts.
        each(ACTIVE_EVENTS, type => mergeActiveFn(this, props, type))

        const result = getFinishedResult(this, checkFinished(this, prevTo))
        flushCalls(this._pendingCalls, result)
        this._pendingCalls.add(resolve)

        if (anim.changed)
          raf.batchedUpdates(() => {
            // Ensure `onStart` can be called after a reset.
            anim.changed = !reset

            // Call the active `onRest` handler from the interrupted animation.
            onRest?.(result, this)

            // Notify the default `onRest` of the reset, but wait for the
            // first frame to pass before sending an `onStart` event.
            if (reset) {
              callProp(defaultProps.onRest, result)
            }
            // Call the active `onStart` handler here since the first frame
            // has already passed, which means this is a goal update and not
            // an entirely new animation.
            else {
              anim.onStart?.(result, this)
            }
          })
      }
    }

    if (reset) {
      this._set(value)
    }

    if (hasAsyncTo) {
      resolve(runAsync(props.to, props, this._state, this))
    }

    // Start an animation
    else if (started) {
      this._start()
    }

    // Postpone promise resolution until the animation is finished,
    // so that no-op updates still resolve at the expected time.
    else if (isAnimating(this) && !hasToChanged) {
      this._pendingCalls.add(resolve)
    }

    // Resolve our promise immediately.
    else {
      resolve(getNoopResult(value))
    }
  }

  /** Update the `animation.to` value, which might be a `FluidValue` */
  protected _focus(value: T | FluidValue<T>) {
    const anim = this.animation
    if (value !== anim.to) {
      if (getFluidObservers(this)) {
        this._detach()
      }
      anim.to = value
      if (getFluidObservers(this)) {
        this._attach()
      }
    }
  }

  protected _attach() {
    let priority = 0

    const { to } = this.animation
    if (hasFluidValue(to)) {
      addFluidObserver(to, this)
      if (isFrameValue(to)) {
        priority = to.priority + 1
      }
    }

    this.priority = priority
  }

  protected _detach() {
    const { to } = this.animation
    if (hasFluidValue(to)) {
      removeFluidObserver(to, this)
    }
  }

  /**
   * Update the current value from outside the frameloop,
   * and return the `Animated` node.
   */
  protected _set(arg: T | FluidValue<T>, idle = true): Animated | undefined {
    const value = getFluidValue(arg)
    if (!is.und(value)) {
      const oldNode = getAnimated(this)
      if (!oldNode || !isEqual(value, oldNode.getValue())) {
        // Create a new node or update the existing node.
        const nodeType = getAnimatedType(value)
        if (!oldNode || oldNode.constructor != nodeType) {
          setAnimated(this, nodeType.create(value))
        } else {
          oldNode.setValue(value)
        }
        // Never emit a "change" event for the initial value.
        if (oldNode) {
          raf.batchedUpdates(() => {
            this._onChange(value, idle)
          })
        }
      }
    }
    return getAnimated(this)
  }

  protected _onStart() {
    const anim = this.animation
    if (!anim.changed) {
      anim.changed = true
      sendEvent(
        this,
        'onStart',
        getFinishedResult(this, checkFinished(this, anim.to)),
        this
      )
    }
  }

  protected _onChange(value: T, idle?: boolean) {
    if (!idle) {
      this._onStart()
      callProp(this.animation.onChange, value, this)
    }
    callProp(this.defaultProps.onChange, value, this)
    super._onChange(value, idle)
  }

  // This method resets the animation state (even if already animating) to
  // ensure the latest from/to range is used, and it also ensures this spring
  // is added to the frameloop.
  protected _start() {
    const anim = this.animation

    // Reset the state of each Animated node.
    getAnimated(this)!.reset(getFluidValue(anim.to))

    // Use the current values as the from values.
    if (!anim.immediate) {
      anim.fromValues = anim.values.map(node => node.lastPosition)
    }

    if (!isAnimating(this)) {
      setActiveBit(this, true)
      if (!isPaused(this)) {
        this._resume()
      }
    }
  }

  protected _resume() {
    // The "skipAnimation" global avoids the frameloop.
    if (G.skipAnimation) {
      this.finish()
    } else {
      frameLoop.start(this)
    }
  }

  /**
   * Exit the frameloop and notify `onRest` listeners.
   *
   * Always wrap `_stop` calls with `batchedUpdates`.
   */
  protected _stop(goal?: any, cancel?: boolean) {
    if (isAnimating(this)) {
      setActiveBit(this, false)

      const anim = this.animation
      each(anim.values, node => {
        node.done = true
      })

      // These active handlers must be reset to undefined or else
      // they could be called while idle. But keep them defined
      // when the goal value is dynamic.
      if (anim.toValues) {
        anim.onChange = anim.onPause = anim.onResume = undefined
      }

      callFluidObservers(this, {
        type: 'idle',
        parent: this,
      })

      const result = cancel
        ? getCancelledResult(this.get())
        : getFinishedResult(this.get(), checkFinished(this, goal ?? anim.to))

      flushCalls(this._pendingCalls, result)
      if (anim.changed) {
        anim.changed = false
        sendEvent(this, 'onRest', result, this)
      }
    }
  }
}

/** Returns true when the current value and goal value are equal. */
function checkFinished<T>(target: SpringValue<T>, to: T | FluidValue<T>) {
  const goal = computeGoal(to)
  const value = computeGoal(target.get())
  return isEqual(value, goal)
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

      // Never loop the `pause` prop.
      pause: undefined,

      // For the "reverse" prop to loop as expected, the "to" prop
      // must be undefined. The "reverse" prop is ignored when the
      // "to" prop is an array or function.
      to: !reverse || isAsyncTo(to) ? to : undefined,

      // Ignore the "from" prop except on reset.
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
 * - All non-reserved props are moved into the `to` prop object.
 * - The `keys` prop is set to an array of affected keys,
 *   or `null` if all keys are affected.
 */
export function createUpdate(props: any) {
  const { to, from } = (props = inferTo(props))

  // Collect the keys affected by this update.
  const keys = new Set<string>()

  if (is.obj(to)) findDefined(to, keys)
  if (is.obj(from)) findDefined(from, keys)

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
    update.default = getDefaultProps(update)
  }
  return update
}

/** Find keys with defined values */
function findDefined(values: Lookup, keys: Set<string>) {
  eachProp(values, (value, key) => value != null && keys.add(key as any))
}

/** Event props with "active handler" support */
const ACTIVE_EVENTS = [
  'onStart',
  'onRest',
  'onChange',
  'onPause',
  'onResume',
] as const

function mergeActiveFn<T, P extends EventKey>(
  target: SpringValue<T>,
  props: SpringProps<T>,
  type: P
) {
  target.animation[type] =
    props[type] !== getDefaultProp(props, type)
      ? resolveProp<any>(props[type], target.key)
      : undefined
}

type EventArgs<T, P extends EventKey> = Parameters<
  Extract<SpringProps<T>[P], Function>
>

/** Call the active handler first, then the default handler. */
function sendEvent<T, P extends EventKey>(
  target: SpringValue<T>,
  type: P,
  ...args: EventArgs<T, P>
) {
  target.animation[type]?.(...(args as [any, any]))
  target.defaultProps[type]?.(...(args as [any, any]))
}
