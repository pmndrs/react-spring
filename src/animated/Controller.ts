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
  timestamps: { [key: string]: number } = {}
  values: State = {} as any
  merged: State = {} as any
  animated: AnimatedMap = {}
  animations: AnimationMap = {}
  configs: Animation[] = []
  queue: any[] = []
  prevQueue: any[] = []
  onEndQueue: OnEnd[] = []
  runCount = 0

  getValues = () =>
    this.animated as { [K in keyof State]: Animation<State[K]>['animated'] }

  /**
   * Update the controller by merging the given props into an array of tasks.
   * Individual tasks may be async and/or delayed.
   */
  update(propsArg: UpdateProps<State>) {
    if (!propsArg) return this
    let { delay = 0, to, ...props } = interpolateTo(propsArg) as any

    // For async animations, the `from` prop must be defined for
    // the Animated nodes to exist before animations have started.
    if (props.from) {
      for (const key in props.from) {
        this._ensureAnimated(key, props.from[key])
      }
    }

    if (is.arr(to) || is.fun(to)) {
      if (is.num(delay) && delay < 0) delay = 0
      this.queue.push({
        ...props,
        timestamp: now(),
        delay,
        to,
      })
    } else if (to) {
      // Compute the delay of each key
      const ops: any[] = []
      for (const key in to) {
        this._ensureAnimated(key, to[key])

        // Merge entries with the same delay
        const delay = Math.max(0, callProp(propsArg.delay, key) || 0)
        const previous = ops[delay] || emptyObj
        ops[delay] = {
          ...previous,
          ...props,
          timestamp: now(),
          delay,
          to: { ...previous.to, [key]: to[key] },
        }
      }
      ops.forEach(op => this.queue.push(op))
    }

    return this
  }

  /**
   * Execute any queued updates, else make sure the frameloop is running.
   * The `useSpring` hooks never have > 1 update per call, because they call this every render.
   */
  start(onEnd?: OnEnd) {
    // Apply any queued updates
    if (this.queue.length) this._flush(onEnd)
    // ...or start the frameloop
    else this._start(onEnd)

    return this
  }

  // Clear all animations
  stop(finished?: boolean) {
    if (this.runCount) {
      this.runCount = 0
      this.configs = []
      this.animations = {}
      this._stop(finished)
    }
    return this
  }

  // Called by the frameloop
  onFrame(isActive: boolean) {
    if (this.props.onFrame) {
      this.props.onFrame(this.values)
    }
    if (!isActive) {
      this._stop(true)
    }
  }

  destroy() {
    this.stop()
    this.props = {} as any
    this.timestamps = {}
    this.values = {} as any
    this.merged = {} as any
    this.animated = {} as any
    this.animations = {}
    this.configs = []
  }

  // Create an Animated node if none exists.
  private _ensureAnimated(key: string, value: any) {
    if (this.animated[key]) return
    const animated = createAnimated(value)
    if (!animated) {
      return console.warn('Given value not animatable:', value)
    }

    // Every `animated` needs an `animation` object
    const animation: any = {
      animated,
      animatedValues: toArray(animated.getPayload()),
    }

    this.animated[key] = animated
    this.animations[key] = animation
  }

  // Add this controller to the frameloop.
  private _start(onEnd?: OnEnd) {
    if (this.configs.length) {
      if (onEnd) this.onEndQueue.push(onEnd)
      if (this.idle) {
        this.idle = false
        start(this)
      }
    } else if (onEnd) {
      onEnd(true)
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
    const { prevQueue } = this
    const queue = (this.prevQueue = this.queue)
    this.queue = prevQueue
    prevQueue.length = 0

    // Track the number of running animations.
    let runsLeft = queue.length
    this.runCount += runsLeft

    // Never assume that the last update always finishes last, since that's
    // not true when 2+ async updates have indeterminate durations.
    const onRunEnd = (finished?: boolean) => {
      this.runCount--
      if (--runsLeft) return
      if (onEnd) onEnd(finished)
      if (!this.runCount) {
        const { onRest } = this.props
        if (onRest && finished) {
          onRest(this.merged)
        }
      }
    }

    queue.forEach(({ delay, ...props }) => {
      if (delay) setTimeout(() => this._run(props, onRunEnd), delay)
      else this._run(props, onRunEnd)
    })
  }

  private _run(props: UpdateProps<State>, onEnd?: OnEnd) {
    if (this._diff(props)) {
      this._animate(this.props)
      if (is.arr(props.to) || is.fun(props.to)) {
        this._runAsync(props, onEnd)
      } else {
        this._start(onEnd)
      }
    }
  }

  // Start an async chain or an async script.
  private _runAsync({ to }: UpdateProps<State>, onEnd?: OnEnd) {
    const { animations } = this

    // The `stop` and `destroy` methods clear the animation map.
    const isCancelled = () => animations !== this.animations

    let last: Promise<void>
    const next = (asyncProps: SpringProps<State>) => {
      if (isCancelled()) throw this
      if (to !== this.props.to) return
      return (last = new Promise<any>(done => {
        this.update(asyncProps).start(done)
      }))
    }

    let queue = Promise.resolve()
    if (is.arr(to)) {
      to.forEach(props => (queue = queue.then(() => next(props))))
    } else if (is.fun(to)) {
      queue = queue.then(() => to(next, this.stop.bind(this)).then(() => last))
    }

    queue = queue.catch(err => {
      // "this" is thrown when the animation is cancelled
      if (err !== this) console.error(err)
    })

    if (onEnd) {
      queue.then(() => onEnd(!isCancelled()))
    }
  }

  // Merge every fresh prop. Return false if no props were fresh.
  private _diff({ timestamp, ...props }: UpdateProps<State>): boolean {
    let changed = false

    // Ensure the newer timestamp is used.
    const diffTimestamp = (keyPath: string) => {
      const previous = this.timestamps[keyPath]
      if (is.und(previous) || timestamp! > previous) {
        this.timestamps[keyPath] = timestamp!
        return true
      }
      return false
    }

    // Generalized diffing algorithm
    const diffProp = (keys: string[], value: unknown, parent: any) => {
      const lastKey = keys[keys.length - 1]
      if (is.obj(value)) {
        if (is.und(parent[lastKey])) parent[lastKey] = {}
        for (const key in value) {
          diffProp(keys.concat(key), value[key], parent[lastKey])
        }
      } else if (diffTimestamp(keys.join('.'))) {
        let oldValue = parent[lastKey]
        if (!is.equ(value, oldValue)) {
          changed = true
          parent[lastKey] = value
        }
      }
    }

    for (const key in props) {
      diffProp([key], (props as any)[key], this.props)
    }
    return changed
  }

  // Update the animation configs.
  private _animate({
    to = emptyObj,
    from = emptyObj,
    config = emptyObj,
    reverse,
    attach,
    reset,
    immediate,
    onStart,
  }: UpdateProps<State>) {
    // True if any animation was updated
    let changed = false

    // The animations that are starting or restarting
    const started: string[] = []

    // Attachment handling, trailed springs can "attach" themselves to a previous spring
    const target = attach && attach(this)

    // Reverse values when requested
    if (reverse) [from, to] = [to as any, from]

    // Merge `from` values with `to` values
    this.merged = { ...from, ...this.merged, ...to }

    // Reduces input { key: value } pairs into animation objects
    for (const key in this.merged) {
      const state = this.animations[key as any]
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
      const goalValue = computeGoalValue<any>(value)

      // The animation is done already if the current value is the goal value.
      if (!reset && is.equ(goalValue, animated.getValue())) {
        changed = true

        const values = toArray(goalValue)
        animatedValues.forEach((animated, i) => {
          animated.done = true
          if (isAnimatableString(values[i])) {
            animated.setValue(1, false)
          }
        })

        this.animations[key] = { ...state, key, goalValue }
        continue
      }

      const newConfig = callProp(config, key)

      // Animations are only updated when they were reset, they have a new
      // goal value, or their spring config was changed.
      if (
        reset ||
        !is.equ(goalValue, state.goalValue) ||
        !is.equ(newConfig, state.config)
      ) {
        const isImmediate = callProp(immediate, key)
        if (!isImmediate) started.push(key)

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

            if (!reset) output[0] = animated.calc(input.value)
            animated.updateConfig({ output })

            input.setValue(0, false)
            input.reset(isActive)
          } else {
            input = new AnimatedValue(0)
            animated = input.interpolate({ output })
          }
          if (isImmediate) {
            input.setValue(1, false)
          }
        } else {
          // Convert values into Animated nodes (reusing nodes whenever possible)
          if (is.arr(value)) {
            if (animated instanceof AnimatedValueArray) {
              animatedValues.forEach(v => v.reset(isActive))
            } else {
              animated = createAnimated<any[]>(fromValue)
            }
          } else {
            if (animated instanceof AnimatedValue) {
              animated.reset(isActive)
            } else {
              animated = new AnimatedValue(fromValue)
            }
          }
          if (reset || isImmediate) {
            animated.setValue(isImmediate ? goalValue : fromValue, false)
          }
        }

        // Update the array of Animated nodes used by the frameloop
        animatedValues = toArray(animated.getPayload() as any)

        changed = true
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
          immediate: isImmediate,
          duration: newConfig.duration,
          easing: withDefault(newConfig.easing, linear),
          decay: newConfig.decay,
          mass: withDefault(newConfig.mass, 1),
          tension: withDefault(newConfig.tension, 170),
          friction: withDefault(newConfig.friction, 26),
          initialVelocity: withDefault(newConfig.velocity, 0),
          clamp: withDefault(newConfig.clamp, false),
          precision: withDefault(newConfig.precision, 0.01),
          config: newConfig,
        }
      }
    }

    if (changed) {
      if (onStart && started.length) {
        started.forEach(key => onStart!(this.animations[key]))
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

// Wrap any value with an Animated node
function createAnimated<T>(
  value: T
): T extends ReadonlyArray<any>
  ? AnimatedValueArray
  : AnimatedValue | AnimatedInterpolation | null {
  return is.arr(value)
    ? new AnimatedValueArray(
        value.map(fromValue => {
          const animated = createAnimated(fromValue)!
          if (!animated) console.warn('Given value not animatable:', fromValue)
          return animated instanceof AnimatedValue
            ? animated
            : (animated.getPayload() as any)
        })
      )
    : isAnimatableString(value)
    ? (new AnimatedValue(0).interpolate({
        output: [value, value] as any,
      }) as any)
    : is.num(value) || is.str(value)
    ? new AnimatedValue(value)
    : null
}

export default Controller
