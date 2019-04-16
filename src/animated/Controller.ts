import {
  callProp,
  interpolateTo,
  is,
  toArray,
  withDefault,
} from '../shared/helpers'
import AnimatedValue from './AnimatedValue'
import AnimatedValueArray from './AnimatedValueArray'
import AnimatedInterpolation from './AnimatedInterpolation'
import { start, stop } from './FrameLoop'
import { colorNames, interpolation as interp, now } from './Globals'
import { SpringProps, SpringConfig } from '../../types/renderprops'

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

interface Animation<T = any> extends Omit<SpringConfig, 'velocity'> {
  key: string
  config: SpringConfig
  initialVelocity: number
  immediate?: boolean
  goalValue: T
  toValues: T extends ReadonlyArray<any> ? T : [T]
  fromValues: T extends ReadonlyArray<any> ? T : [T]
  animatedValues: AnimatedValue[]
  animated: T extends ReadonlyArray<any>
    ? AnimatedValueArray
    : AnimatedValue | AnimatedInterpolation
}

type AnimationMap = { [key: string]: Animation }
type AnimatedMap = { [key: string]: Animation['animated'] }

interface UpdateProps<DS extends object> extends SpringProps<DS> {
  [key: string]: any
  timestamp?: number
  attach?: (ctrl: Controller) => Controller
}

type OnEnd = (finished?: boolean) => void

// Default easing
const linear = (t: number) => t

const emptyObj: any = Object.freeze({})

let nextId = 1
class Controller<State extends object = any> {
  id = nextId++
  idle = true
  props: UpdateProps<State> = {}
  queue: any[] = []
  timestamps: { [key: string]: number } = {}
  values: State = {} as any
  merged: State = {} as any
  animated: AnimatedMap = {}
  animations: AnimationMap = {}
  configs: Animation[] = []
  onEndQueue: OnEnd[] = []
  runCount = 0

  getValues = () =>
    this.animated as { [K in keyof State]: Animation<State[K]>['animated'] }

  constructor(props?: UpdateProps<State>) {
    if (props) this.update(props).start()
  }

  /**
   * Push props into the update queue. The props are used after `start` is
   * called and any delay is over. The props are intelligently diffed to ensure
   * that later calls to this method properly override any delayed props.
   * The `propsArg` argument is always copied before mutations are made.
   */
  update(propsArg: UpdateProps<State>) {
    if (!propsArg) return this
    const props = interpolateTo(propsArg) as any

    // For async animations, the `from` prop must be defined for
    // the Animated nodes to exist before animations have started.
    this._ensureAnimated(props.from)
    if (is.obj(props.to)) {
      this._ensureAnimated(props.to)
    }

    props.timestamp = now()

    // The `delay` prop of every update must be a number >= 0
    if (is.fun(props.delay) && is.obj(props.to)) {
      for (const key in props.to) {
        this.queue.push({
          ...props,
          to: { [key]: props.to[key] },
          from: key in props.from ? { [key]: props.from[key] } : void 0,
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
  stop(...keys: string[]): this
  stop(finished: boolean, ...keys: string[]): this
  stop(...keys: [boolean, ...any[]] | string[]) {
    let finished = false
    if (is.boo(keys[0])) [finished, ...keys] = keys

    // Stop animations by key
    if (keys.length) {
      for (const key of keys) {
        const index = this.configs.findIndex(config => key === config.key)
        this._stopAnimation(key)
        this.configs[index] = this.animations[key]
      }
    }
    // Stop all animations
    else if (this.runCount) {
      // Stop all async animations
      this.animations = { ...this.animations }

      // Update the animation configs
      this.configs.forEach(config => this._stopAnimation(config.key))
      this.configs = Object.values(this.animations)

      // Exit the frameloop
      this._stop(finished)
    }
    return this
  }

  /** @internal Called by the frameloop */
  onFrame(isActive: boolean) {
    if (this.props.onFrame) {
      this.props.onFrame(this.values)
    }
    if (!isActive) {
      this._stop(true)
    }
  }

  /** Reset the internal state */
  destroy() {
    this.stop()
    this.props = {}
    this.timestamps = {}
    this.values = {} as any
    this.merged = {} as any
    this.animated = {}
    this.animations = {}
    this.configs = []
  }

  /**
   * Set a prop for the next animations where the prop is undefined. The given
   * value is overridden by the next update where the prop is defined.
   *
   * Ongoing animations are not changed.
   */
  setProp<P extends keyof UpdateProps<State>>(
    key: P,
    value: UpdateProps<State>[P]
  ) {
    this.props[key] = value
    this.timestamps[key] = now()
    return this
  }

  // Create an Animated node if none exists.
  private _ensureAnimated(values: any) {
    for (const key in values) {
      if (this.animated[key]) continue
      const value = values[key]
      const animated = createAnimated(value)
      if (animated) {
        this.animated[key] = animated
        this._stopAnimation(key)
      } else {
        console.warn('Given value not animatable:', value)
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
      start(this)
    }
  }

  // Remove this controller from the frameloop, and notify any listeners.
  private _stop(finished?: boolean) {
    this.idle = true
    stop(this)

    const { onEndQueue } = this
    if (onEndQueue.length) {
      this.onEndQueue = []
      onEndQueue.forEach(onEnd => onEnd(finished))
    }
  }

  // Execute the current queue of prop updates.
  private _flush(onEnd?: OnEnd) {
    const queue = this.queue.reduce(reduceDelays, [])
    this.queue.length = 0

    // Track the number of running animations.
    let runsLeft = Object.keys(queue).length
    this.runCount += runsLeft

    // Never assume that the last update always finishes last, since that's
    // not true when 2+ async updates have indeterminate durations.
    const onRunEnd = (finished?: boolean) => {
      this.runCount--
      if (--runsLeft) return
      if (onEnd) onEnd(finished)
      if (!this.runCount && finished) {
        const { onRest } = this.props
        if (onRest) onRest(this.merged)
      }
    }

    queue.forEach((props, delay) => {
      if (delay) setTimeout(() => this._run(props, onRunEnd), delay)
      else this._run(props, onRunEnd)
    })
  }

  // Update the props and animations
  private _run(props: UpdateProps<State>, onEnd: OnEnd) {
    if (is.arr(props.to) || is.fun(props.to)) {
      this._runAsync(props, onEnd)
    } else if (this._diff(props)) {
      this._animate(props)._start(onEnd)
    } else {
      this._onEnd(onEnd)
    }
  }

  // Start an async chain or an async script.
  private _runAsync({ to, ...props }: UpdateProps<State>, onEnd: OnEnd) {
    // Merge other props immediately.
    if (this._diff(props)) {
      this._animate(this.props)
    }

    // This async animation might be overridden.
    if (!this._diff({ asyncTo: to, timestamp: props.timestamp })) {
      return onEnd(false)
    }

    // Async chains run to completion. Async scripts are interrupted.
    const { animations } = this
    const isCancelled = () =>
      // The `stop` and `destroy` methods clear the animation map.
      animations !== this.animations ||
      // Async scripts are cancelled when a new chain/script begins.
      (is.fun(to) && to !== this.props.asyncTo)

    let last: Promise<void>
    const next = (props: UpdateProps<State>) => {
      if (isCancelled()) throw this
      return (last = new Promise<any>(done => {
        this.update(props).start(done)
      })).then(() => {
        if (isCancelled()) throw this
      })
    }

    let queue = Promise.resolve()
    if (is.arr(to)) {
      to.forEach(props => (queue = queue.then(() => next(props))))
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
  // These props are ignored: (config, immediate, reverse)
  private _diff({
    timestamp,
    config,
    immediate,
    reverse,
    ...props
  }: UpdateProps<State>) {
    let changed = false

    // Ensure the newer timestamp is used.
    const diffTimestamp = (keyPath: string) => {
      const previous = this.timestamps[keyPath]
      if (is.und(previous) || timestamp! >= previous) {
        this.timestamps[keyPath] = timestamp!
        return true
      }
      return false
    }

    // Generalized diffing algorithm
    const diffProp = (keys: string[], value: any, parent: any) => {
      if (is.und(value)) return
      const lastKey = keys[keys.length - 1]
      if (is.obj(value)) {
        if (!is.obj(parent[lastKey])) parent[lastKey] = {}
        for (const key in value) {
          diffProp(keys.concat(key), value[key], parent[lastKey])
        }
      } else if (diffTimestamp(keys.join('.'))) {
        const oldValue = parent[lastKey]
        if (!is.equ(value, oldValue)) {
          changed = true
          parent[lastKey] = value
        }
      }
    }

    if (reverse) {
      const to: any = props.to
      props.to = props.from
      props.from = is.obj(to) ? to : void 0
    }

    for (const key in props) {
      diffProp([key], props[key], this.props)
    }

    // Never cache "reset: true"
    if (props.reset) {
      this.props.reset = false
    }

    return changed
  }

  // Update the animation configs. The given props override any default props.
  private _animate(props: UpdateProps<State>) {
    const { from = emptyObj, to = emptyObj } = this.props

    // Merge `from` values with `to` values
    this.merged = { ...from, ...to }

    // True if any animation was updated
    let changed = false

    // The animations that are starting or restarting
    const started: string[] = []

    // Attachment handling, trailed springs can "attach" themselves to a previous spring
    const target = this.props.attach && this.props.attach(this)

    // Reduces input { key: value } pairs into animation objects
    for (const key in this.merged) {
      const state = this.animations[key]
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

      // Stop animations with a goal value equal to its current value.
      if (!props.reset && is.equ(goalValue, animated.getValue())) {
        // The animation might be stopped already.
        if (!is.und(state.goalValue)) {
          changed = true
          this._stopAnimation(key)
        }
        continue
      }

      // Replace an animation when its goal value is changed (or it's been reset)
      if (props.reset || !is.equ(goalValue, state.goalValue)) {
        let { immediate } = is.und(props.immediate) ? this.props : props
        immediate = callProp(immediate, key)
        if (!immediate) {
          started.push(key)
        }

        const isActive = animatedValues.some(v => !v.done)
        const fromValue = !is.und(from[key])
          ? computeGoalValue(from[key])
          : goalValue

        // Animatable strings use interpolation
        const isInterpolated = isAnimatableString(value)
        if (isInterpolated) {
          let input: AnimatedValue
          const output: any[] = [fromValue, goalValue]
          if (animated instanceof AnimatedInterpolation) {
            input = animatedValues[0]

            if (!props.reset) output[0] = animated.calc(input.value)
            animated.updateConfig({ output })

            input.setValue(0, false)
            input.reset(isActive)
          } else {
            input = new AnimatedValue(0)
            animated = input.interpolate({ output })
          }
          if (immediate) {
            input.setValue(1, false)
          }
        } else {
          // Convert values into Animated nodes (reusing nodes whenever possible)
          if (is.arr(value)) {
            if (animated instanceof AnimatedValueArray) {
              if (props.reset) animated.setValue(fromValue, false)
              animatedValues.forEach(v => v.reset(isActive))
            } else {
              animated = createAnimated<any[]>(fromValue)
            }
          } else {
            if (animated instanceof AnimatedValue) {
              if (props.reset) animated.setValue(fromValue, false)
              animated.reset(isActive)
            } else {
              animated = new AnimatedValue(fromValue)
            }
          }
          if (immediate) {
            animated.setValue(goalValue, false)
          }
        }

        // Only change the "config" of updated animations.
        const config: SpringConfig =
          callProp(props.config, key) ||
          callProp(this.props.config, key) ||
          emptyObj

        changed = true
        animatedValues = toArray(animated.getPayload() as any)
        this.animations[key] = {
          key,
          goalValue,
          toValues: toArray(
            target
              ? target.animations[key].animated.getPayload()
              : (isInterpolated && 1) || goalValue
          ),
          fromValues: animatedValues.map(v => v.getValue()),
          animated,
          animatedValues,
          immediate,
          duration: config.duration,
          easing: withDefault(config.easing, linear),
          decay: config.decay,
          mass: withDefault(config.mass, 1),
          tension: withDefault(config.tension, 170),
          friction: withDefault(config.friction, 26),
          initialVelocity: withDefault(config.velocity, 0),
          clamp: withDefault(config.clamp, false),
          precision: withDefault(config.precision, 0.01),
          config,
        }
      }
    }

    if (changed) {
      if (this.props.onStart && started.length) {
        started.forEach(key => this.props.onStart!(this.animations[key]))
      }

      // Make animations available to the frameloop
      const configs = (this.configs = [] as Animation[])
      const values = (this.values = {} as any)
      const nodes = (this.animated = {} as any)
      for (const key in this.animations) {
        const config = this.animations[key]
        configs.push(config)
        values[key] = config.animated.getValue()
        nodes[key] = config.animated
      }
    }
    return this
  }

  // Stop an animation by its key
  private _stopAnimation(key: string) {
    if (!this.animated[key]) return

    const state = this.animations[key]
    if (state && is.und(state.goalValue)) return

    let { animated, animatedValues } = state || emptyObj
    if (!state) {
      animated = this.animated[key]
      animatedValues = toArray(animated.getPayload() as any)
    }

    this.animations[key] = { key, animated, animatedValues } as any
    animatedValues.forEach(v => (v.done = true))

    // Prevent delayed updates to this key.
    this.timestamps['to.' + key] = now()
  }
}

export default Controller

// Wrap any value with an Animated node
function createAnimated<T>(
  value: T
): T extends ReadonlyArray<any>
  ? AnimatedValueArray
  : AnimatedValue | AnimatedInterpolation {
  return is.arr(value)
    ? new AnimatedValueArray(
        value.map(value => {
          const animated = createAnimated(value)
          const payload: any = animated.getPayload()
          return animated instanceof AnimatedInterpolation
            ? payload[0]
            : payload
        })
      )
    : isAnimatableString(value)
    ? (new AnimatedValue(0).interpolate({
        output: [value, value] as any,
      }) as any)
    : new AnimatedValue(value)
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
  return value.startsWith('#') || /\d/.test(value) || !!colorNames[value]
}

// Compute the goal value, converting "red" to "rgba(255, 0, 0, 1)" in the process
function computeGoalValue<T>(value: T): T {
  return is.arr(value)
    ? value.map(computeGoalValue)
    : isAnimatableString(value)
    ? (interp as any)({ range: [0, 1], output: [value, value] })(1)
    : value
}
