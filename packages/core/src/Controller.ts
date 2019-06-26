import { is, toArray, each } from 'shared'
import * as G from 'shared/globals'
import {
  Animatable,
  Animation,
  AnimationList,
  AnimationMap,
  AnimationProps,
  AnimatedNodes,
  SpringAsyncFn,
  SpringConfig,
  SpringUpdate,
  ToProp,
} from './types/spring'
import { StringKeys, Indexable, OnEnd, Falsy, Merge } from './types/common'
import { callProp, interpolateTo, withDefault, freeze } from './helpers'
import {
  Animated,
  AnimatedArray,
  AnimatedInterpolation,
  AnimatedValue,
} from '@react-spring/animated'

/**
 * A tuple containing:
 *
 *   [0] `controllerID`: The controller being updated
 *
 *   [1] `idle`: True when all animations have finished
 *
 *   [2] `changes`: An array of `[key, value]` tuples
 */
export type FrameUpdate<State extends object = any> = [
  number,
  boolean,
  [keyof State, State[keyof State]][] | null
]

/** Controller props in pending updates */
type PendingProps<State extends object> = Merge<
  AnimationProps<State>,
  {
    to?: ToProp<State>
    from?: Partial<State>
    parent?: Controller | null
    attach?: (ctrl: Controller) => Controller | null
    timestamp?: number
  }
>

/** Controller props from previous updates */
type CachedProps<State extends object> = Merge<
  PendingProps<State>,
  {
    to?: Partial<State>
    asyncTo?: ReadonlyArray<SpringUpdate<State>> | SpringAsyncFn<State>
  }
>

// Default easing
const linear = (t: number) => t

const emptyObj: any = Object.freeze({})

let nextId = 1
export class Controller<State extends Indexable = any> {
  id = nextId++
  idle = true
  runCount = 0
  destroyed = false
  props: CachedProps<State> = {}
  queue: any[] = []
  timestamps: Indexable<number> = {}
  values: State = {} as any
  merged: State = {} as any
  animated: AnimatedNodes<State> = {} as any
  animations: AnimationMap<State> = {} as any
  configs: AnimationList<State> = []
  children: Controller[] = []
  onEndQueue: OnEnd[] = []
  cancelledAt = 0

  constructor(props?: Partial<State> & PendingProps<State>) {
    if (props) this.update(props).start()
  }

  /**
   * Push props into the update queue. The props are used after `start` is
   * called and any delay is over. The props are intelligently diffed to ensure
   * that later calls to this method properly override any delayed props.
   * The `propsArg` argument is always copied before mutations are made.
   */
  update(propsArg: (Partial<State> & PendingProps<State>) | Falsy) {
    if (!propsArg || this.destroyed) return this
    const props: PendingProps<State> = interpolateTo(propsArg)

    // For async animations, the `from` prop must be defined for
    // the Animated nodes to exist before animations have started.
    this._ensureAnimated(props.from, true)
    this._ensureAnimated(props.to)

    props.timestamp = G.now()

    // The `delay` prop of every update must be a number >= 0
    if (is.fun(props.delay) && is.obj(props.to)) {
      const from = props.from || emptyObj
      for (const key in props.to) {
        this.queue.push({
          ...props,
          to: { [key]: props.to[key] },
          from: key in from ? { [key]: from[key] } : void 0,
          delay: Math.max(0, Math.round(props.delay(key))),
        })
      }
    } else {
      props.delay = is.num(props.delay)
        ? Math.max(0, Math.round(props.delay))
        : 0

      // Coerce falsy values to undefined for these props
      if (!props.to) props.to = void 0
      if (!props.from) props.from = void 0

      this.queue.push(props)
    }
    return this
  }

  /**
   * Flush the update queue.
   * If the queue is empty, try starting the frameloop.
   */
  start(onEnd?: OnEnd) {
    if (this.queue.length) this._flush(onEnd)
    else this._start(onEnd)
    return this
  }

  /** Stop one animation or all animations */
  stop(...keys: StringKeys<State>[]): this
  stop(finished?: boolean, ...keys: StringKeys<State>[]): this
  stop(...keys: any[]) {
    let finished = false
    if (is.boo(keys[0])) [finished, ...keys] = keys

    // Stop animations by key
    if (keys.length) {
      for (const key of keys as StringKeys<State>[]) {
        const index = this.configs.findIndex(config => key === config.key)
        this._stopAnimation(key)
        this.configs[index] = this.animations[key]
      }
    }
    // Stop all animations
    else if (this.runCount) {
      this.cancelledAt = G.now()

      // Update the animation configs
      each(this.configs, config => this._stopAnimation(config.key))
      this.configs = Object.values(this.animations) as any

      // Exit the frameloop
      this._stop(finished)
    }
    return this
  }

  /** Revert the controller to its initial state */
  reset() {
    // Stop all current animations
    this.stop()

    // Revert the internal state
    this.destroyed = false
    this.props = {}
    this.queue = []
    this.timestamps = {}
    this.values = {} as any
    this.merged = {} as any
    this.animated = {} as any
    this.animations = {} as any
    this.configs = []

    return this
  }

  /** Prevent all current and future animation */
  destroy() {
    if (!this.destroyed) {
      this.stop()
      this.destroyed = true
    }
  }

  /** @internal Called by the frameloop */
  onFrame([id, idle, changes]: FrameUpdate<State>) {
    if (id !== this.id) return
    if (changes && changes.length) {
      for (const [key, value] of changes) {
        this.values[key] = value
      }
      // The `onFrame` prop always exists when `changes` exists.
      this.props.onFrame!({
        ...this.values,
      })
    }
    if (idle) {
      this._stop(true)
    }
  }

  /**
   * Set a prop for the next animations where the prop is undefined. The given
   * value is overridden by the next update where the prop is defined.
   *
   * Ongoing animations are not changed.
   */
  setProp<P extends keyof CachedProps<State>>(
    key: P & string,
    value: CachedProps<State>[P]
  ) {
    this.props[key] = value
    this.timestamps[key] = G.now()
    return this
  }

  /** @internal Get the `AnimatedValue` nodes for the given key */
  getPayload(key: string): AnimatedValue[] | undefined {
    const anim = this.animations[key]
    return anim && anim.animatedValues
  }

  // Create an Animated node if none exists.
  private _ensureAnimated(values: unknown, shouldUpdate = false) {
    if (!is.obj(values)) return
    for (const key in values as Partial<State>) {
      const value = values[key]
      let animated: any = this.animated[key]
      if (animated && shouldUpdate && this.animations[key].isNew) {
        // Ensure the initial value is up-to-date.
        if (animated.setValue) {
          animated.setValue(value)
        } else {
          // Derived nodes need to be swapped out.
          animated = null
        }
      }
      if (!animated) {
        animated = createAnimated(value)
        if (this.animated[key]) {
          // Swap out the old node with the new node.
          moveChildren(this.animated[key], animated)
        }
        this.animated[key] = animated
        this._stopAnimation(key, true)
      }
    }
  }

  // Listen for all animations to end.
  private _onEnd(onEnd: OnEnd) {
    if (this.runCount) this.onEndQueue.push(onEnd)
    else onEnd(true)
  }

  // Add this controller to the frameloop.
  private _start(onEnd?: OnEnd) {
    if (onEnd) this._onEnd(onEnd)
    if (this.idle && this.runCount) {
      this.idle = false
      G.frameLoop.start(this)
    }
  }

  // Attach our children to the given keys if possible.
  private _attach(keys: string[], visited: { [id: number]: true } = {}) {
    each(this.children, c => {
      if (visited[this.id]) return
      visited[this.id] = true
      const attached = keys.filter(key => {
        const payload = c.getPayload(key)
        if (payload) {
          each(payload, node => node.done && node.reset(true))
          return true
        }
      })
      if (attached.length) {
        c._attach(attached, visited)
        c._start()
      }
    })
  }

  // Remove this controller from the frameloop, and notify any listeners.
  private _stop(finished?: boolean) {
    this.idle = true
    G.frameLoop.stop(this)

    const { onEndQueue } = this
    if (onEndQueue.length) {
      this.onEndQueue = []
      each(onEndQueue, onEnd => onEnd(finished))
    }
  }

  // Execute the current queue of prop updates.
  private _flush(onEnd?: OnEnd) {
    const queue = this.queue.reduce(reduceDelays, [])
    this.queue.length = 0

    // Track the number of active `_run` calls.
    let runsLeft = Object.keys(queue).length
    this.runCount += runsLeft

    // Never assume that the last update always finishes last, since that's
    // not true when 2+ async updates have indeterminate durations.
    const onRunEnd: OnEnd = finished => {
      this.runCount--
      if (--runsLeft) return
      if (onEnd) onEnd(finished)
      if (!this.runCount && finished) {
        const { onRest } = this.props
        if (is.fun(onRest)) {
          onRest(this.merged)
        }
      }
    }

    each(queue, (props, delay) => {
      if (delay) {
        setTimeout(() => {
          // Cancelling methods touch the `cancelledAt` property
          if (props.timestamp < this.cancelledAt) return
          this._run(props, onRunEnd)
        }, delay)
      } else {
        this._run(props, onRunEnd)
      }
    })
  }

  // Update the props and animations
  private _run(props: PendingProps<State>, onEnd: OnEnd) {
    if (is.arr(props.to) || is.fun(props.to)) {
      this._runAsync(props, onEnd)
    } else if (this._diff(props)) {
      this._animate(props)._start(onEnd)
    } else {
      this._onEnd(onEnd)
    }
  }

  // Start an async chain or an async script.
  private _runAsync({ to, ...props }: PendingProps<State>, onEnd: OnEnd) {
    // Merge other props immediately.
    if (this._diff(props)) {
      this._animate(props)
    }

    // Async scripts can be declaratively cancelled.
    if (props.cancel === true) {
      this.props.asyncTo = void 0
      return onEnd(false)
    }

    // Never run more than one script at a time
    const { timestamp } = props
    if (!this._diff({ asyncTo: to, timestamp })) {
      return onEnd(false)
    }

    const isCancelled = () =>
      // Cancelling methods touch the `cancelledAt` property
      timestamp! < this.cancelledAt ||
      // Async scripts are also cancelled when a new chain/script begins
      (is.fun(to) && to !== this.props.asyncTo)

    let last: Promise<void>
    const next = (props: Partial<State> & PendingProps<State>) => {
      if (isCancelled()) throw this
      return (last = new Promise<any>(done => {
        this.update(props).start(done)
      })).then(() => {
        if (isCancelled()) throw this
      })
    }

    let queue = Promise.resolve()
    if (is.arr(to)) {
      each(to, props => {
        queue = queue.then(() => next(props))
      })
    } else if (is.fun(to)) {
      queue = queue.then(() =>
        to(next, this.stop.bind(this))
          // Always wait for the last update.
          .then(() => last)
      )
    }

    queue
      .catch(err => err !== this && console.error(err))
      .then(() => onEnd(!isCancelled()))
  }

  // Merge every fresh prop. Returns true if one or more props changed.
  // These props cannot trigger an update by themselves:
  //   [delay, config, immediate, reverse, attach]
  private _diff({
    timestamp,
    delay,
    config,
    immediate,
    reverse,
    attach,
    ...props
  }: PendingProps<State> & Indexable) {
    let changed = false

    // Generalized diffing algorithm
    const diffProp = (keys: string[], value: any, owner: any) => {
      if (is.und(value)) return
      const lastKey = keys[keys.length - 1]
      if (is.obj(value)) {
        if (!is.obj(owner[lastKey])) owner[lastKey] = {}
        for (const key in value) {
          diffProp(keys.concat(key), value[key], owner[lastKey])
        }
      } else {
        const keyPath = keys.join('.')
        const oldTimestamp = this.timestamps[keyPath]
        if (is.und(oldTimestamp) || timestamp! >= oldTimestamp) {
          this.timestamps[keyPath] = timestamp!
          const oldValue = owner[lastKey]
          if (!isEqual(value, oldValue)) {
            changed = true
            owner[lastKey] = value
          }
        }
      }
    }

    if (reverse) {
      const { to } = props
      props.to = props.from
      props.from = (is.obj(to) ? to : void 0) as any
    }

    // The "attach" prop is called on every diff. It overwrites the "parent" prop.
    props.parent = (attach ? attach(this) : props.parent) || null
    const oldParent = this.props.parent || null
    if (props.parent !== oldParent) {
      if (oldParent)
        oldParent.children.splice(oldParent.children.indexOf(this), 1)
      if (props.parent) props.parent.children.push(this)
    }

    for (const key in props) {
      diffProp([key], props[key], this.props)
    }

    // These props only affect one update
    if ('reset' in props) this.props.reset = false
    if ('cancel' in props) this.props.cancel = void 0

    return changed
  }

  // Return true if the given prop was changed by this update
  private _isModified(props: PendingProps<State>, prop: string) {
    return this.timestamps[prop] === props.timestamp
  }

  // Update the animation configs. The given props override any default props.
  private _animate(props: PendingProps<State>) {
    const {
      from = emptyObj,
      to = emptyObj,
      parent,
      onAnimate,
      onStart,
    } = this.props

    if (is.fun(onAnimate)) {
      onAnimate(props as any, this as any)
    }

    let isPrevented = (_: string) => false
    if (props.cancel && this._isModified(props, 'cancel')) {
      // Stop all animations when `cancel` is true
      if (props.cancel === true) {
        this.stop()

        // Prevent pending updates from *before* this update only!
        // (This must come after the `stop` call above)
        this.cancelledAt = props.timestamp!
        return this
      }
      // Prevent matching properties from animating when
      // `cancel` is a string or array of strings
      const keys = toArray(props.cancel)
      if (is.arr(keys) && keys.length) {
        isPrevented = key => keys.indexOf(key) >= 0
        this.stop(...keys)
      }
    }

    // Merge `from` values with `to` values
    this.merged = freeze({ ...from, ...to })

    // True if any animation was updated
    let changed = false

    // The animations that are starting or restarting
    const started: string[] = []

    // Attach when a new "parent" controller exists.
    const isAttaching = parent && this._isModified(props, 'parent')

    // Reduces input { key: value } pairs into animation objects
    for (const key in this.merged) {
      if (isPrevented(key)) continue
      const state = this.animations[key] as Animation<any>
      if (!state) {
        console.warn(
          `Failed to animate key: "${key}"\n` +
            `Did you forget to define "from.${key}" for an async animation?`
        )
        continue
      }

      // Reuse the Animated nodes whenever possible
      let { animated, animatedValues } = state

      const value = this.merged[key]
      const goalValue = computeGoalValue(value)
      const currValue = animated.getValue()

      // Stop animations with a goal value equal to its current value.
      if (!props.reset && !isAttaching && isEqual(goalValue, currValue)) {
        // The animation might be stopped already.
        if (!state.idle) {
          changed = true
          this._stopAnimation(key)
        }
        continue
      }

      // Replace an animation when its goal value is changed (or it's been reset)
      if (
        props.reset ||
        isAttaching ||
        !isEqual(goalValue, state.isNew ? currValue : state.goalValue)
      ) {
        const immediate = !!callProp(
          (is.und(props.immediate) ? this.props : props).immediate,
          key
        )

        const isActive = animatedValues.some(node => !node.done)
        const fromValue = !is.und(from[key])
          ? computeGoalValue(from[key])
          : goalValue

        // Animatable strings use interpolation
        const isInterpolated = isAnimatableString(value)
        if (isInterpolated) {
          const output: any[] = [
            props.reset ? fromValue : animated.getValue(),
            goalValue,
          ]
          let input = animatedValues[0]
          if (input) {
            input.setValue(0, false)
            input.reset(isActive)
          } else {
            input = new AnimatedValue(0)
          }
          try {
            const prev = animated
            animated = input.interpolate({ output }) as any
            moveChildren(prev, animated)
          } catch (err) {
            console.warn(
              'Failed to interpolate string from "%s" to "%s"',
              output[0],
              output[1]
            )
            console.error(err)
            continue
          }
          if (G.skipAnimation) {
            input.setValue(1)
            this._stopAnimation(key)
            continue
          }
          if (immediate) {
            input.setValue(1, false)
          }
        } else {
          // Convert values into Animated nodes (reusing nodes whenever possible)
          if (is.arr(value)) {
            if (animated instanceof AnimatedArray) {
              if (props.reset) animated.setValue(fromValue, false)
              each(animatedValues, node => node.reset(isActive))
            } else {
              const prev = animated
              animated = createAnimated(fromValue as any[])
              moveChildren(prev, animated)
            }
          } else {
            if (animated instanceof AnimatedValue) {
              if (props.reset) animated.setValue(fromValue, false)
              animated.reset(isActive)
            } else {
              const prev = animated
              animated = new AnimatedValue(fromValue)
              moveChildren(prev, animated)
            }
          }
          if (G.skipAnimation) {
            animated.setValue!(goalValue)
            this._stopAnimation(key)
            continue
          }
          if (immediate) {
            animated.setValue!(goalValue, false)
          }
        }

        // Only change the "config" of updated animations.
        const config: SpringConfig =
          callProp(props.config, key) ||
          callProp(this.props.config, key) ||
          emptyObj

        if (!(immediate || G.skipAnimation)) {
          started.push(key)
        }

        const fromValues: any = animatedValues.map(v => v.getValue())
        const toValues: any =
          (parent && parent.getPayload(key)) ||
          toArray(isInterpolated ? 1 : goalValue)

        changed = true
        this.animations[key] = {
          key,
          idle: false,
          goalValue,
          toValues,
          fromValues,
          animated,
          animatedValues: Array.from(animated.getPayload()),
          immediate,
          duration: config.duration,
          easing: withDefault(config.easing, linear),
          decay: config.decay,
          mass: withDefault(config.mass, 1),
          tension: withDefault(config.tension, 170),
          friction: withDefault(config.friction, 26),
          initialVelocity: withDefault(config.velocity, 0),
          clamp: withDefault(config.clamp, false),
          precision: withDefault(config.precision, 0.005),
          config,
        }
      }
    }

    if (changed) {
      if (started.length) {
        this._attach(started)
        if (is.fun(onStart))
          each(started, key => {
            onStart(this.animations[key] as any)
          })
      }

      // Make animations available to the frameloop
      const keys = Object.keys(this.animations) as StringKeys<State>[]
      this.configs.length = keys.length
      each(keys, (key, i) => {
        const config = this.animations[key]
        this.configs[i] = config
        this.values[key] = config.animated.getValue()
        this.animated[key] = config.animated
      })
    }
    return this
  }

  /**
   * Stop an animation by its key.
   *
   * This mutates the `timestamps.to[key]`, `props.to[key]`, and `animations[key]` properties.
   * Notably, it does *not* mutate the `configs[key]` or `animated[key]` properties.
   */
  private _stopAnimation(key: StringKeys<State>, isNew?: boolean) {
    const animated = this.animated[key]
    if (!animated) {
      return console.warn(
        `Cannot stop an animation for a key that isn't animated: "${key}"`
      )
    }

    // Prevent any pending updates to this key
    this.timestamps['to.' + key] = G.now()

    // Idle animations are skipped unless their Animated node changed
    const state = this.animations[key] || emptyObj
    if (state.idle && animated === state.animated) return

    // Use the previous `isNew` value if nothing was passed
    if (is.und(isNew)) {
      isNew = !!state.isNew
    }

    // Tell the frameloop to skip animating these values
    const animatedValues = Array.from(animated.getPayload())
    each(animatedValues, node => {
      node.done = true
    })

    // The current value becomes the goal value,
    // which ensures the integrity of the diffing algorithm.
    const goalValue = animated.getValue()
    if (this.props.to) {
      this.props.to[key] = goalValue
    }

    // Remove unused data from this key's animation config
    this.animations[key] = {
      key,
      idle: true,
      isNew,
      goalValue,
      animated,
      animatedValues,
    }
  }
}

/** Wrap any value with an `Animated` node */
function createAnimated<T>(
  value: T
): T extends ReadonlyArray<any>
  ? AnimatedArray
  : AnimatedValue | AnimatedInterpolation {
  return is.arr(value)
    ? new AnimatedArray(value.map(createAnimated))
    : isAnimatableString(value)
    ? // Convert "red" into "rgba(255, 0, 0, 1)" etc
      (new AnimatedValue(0).interpolate({
        output: [value, value] as any,
      }) as any)
    : // The `AnimatedValue` class supports any type, but only numbers are
      // interpolated by the frameloop.
      new AnimatedValue(value)
}

/**
 * Replace an `Animated` node in the graph.
 * This is most useful for async updates, which don't cause a re-render.
 */
function moveChildren(prev: Animated, next: Animated) {
  each([...prev.getChildren()], child => {
    child.updatePayload(prev, next)
    prev.removeChild(child)
    next.addChild(child)
  })
}

// Merge updates with the same delay.
// NOTE: Mutation of `props` may occur!
function reduceDelays(merged: any[], props: any) {
  const prev = merged[props.delay]
  if (prev) {
    props.to = merge(prev.to, props.to)
    props.from = merge(prev.from, props.from)
    Object.assign(prev, props)
  } else {
    merged[props.delay] = props
  }
  return merged
}

function merge(dest: any, src: any) {
  return is.obj(dest) && is.obj(src) ? { ...dest, ...src } : src || dest
}

// Not all strings can be animated (eg: {display: "none"})
function isAnimatableString(value: unknown): boolean {
  if (!is.str(value)) return false
  return (
    value.startsWith('#') ||
    /\d/.test(value) ||
    !!(G.colorNames && G.colorNames[value])
  )
}

// Compute the goal value, converting "red" to "rgba(255, 0, 0, 1)" in the process
function computeGoalValue<T>(value: T): T {
  return is.arr(value)
    ? value.map(computeGoalValue)
    : isAnimatableString(value)
    ? (G.createStringInterpolator as any)({
        range: [0, 1],
        output: [value, value],
      })(1)
    : value
}

// Compare animatable values
function isEqual(a: Animatable, b: Animatable) {
  if (is.arr(a)) {
    if (!is.arr(b) || a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false
    }
    return true
  }
  return a === b
}
