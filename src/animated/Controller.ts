import {
  callProp,
  hasKeys,
  interpolateTo,
  is,
  toArray,
  withDefault,
} from '../shared/helpers'
import AnimatedValue from './AnimatedValue'
import AnimatedValueArray from './AnimatedValueArray'
import AnimatedInterpolation from './AnimatedInterpolation'
import { start, stop } from './FrameLoop'
import { colorNames, interpolation as interp } from './Globals'
import { SpringProps, SpringConfig } from '../../types/renderprops'

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

interface Animation<T = any> extends Omit<SpringConfig, 'velocity'> {
  name: string
  node: T extends any[]
    ? AnimatedValueArray
    : AnimatedValue | AnimatedInterpolation
  immediate?: boolean
  goalValue: T
  toValues: T extends any[] ? T : T[]
  fromValues: T extends any[] ? T : T[]
  animatedValues: (AnimatedValue)[]
  initialVelocity: number
  config: SpringConfig
}

type AnimationMap = { [name: string]: Animation }
type AnimatedMap = { [name: string]: Animation['node'] }

type UpdateProps<DS extends object> = DS &
  SpringProps<DS> & {
    attach?: (ctrl: Controller) => Controller
  }

type OnEnd = (finished?: boolean) => void

// Default easing
const linear = (t: number) => t

let nextId = 1
class Controller<DS extends object = any> {
  id = nextId++
  idle = true
  guid = 0
  props: UpdateProps<DS> = {} as any
  merged: DS = {} as any
  frames: DS = {} as any
  values: AnimatedMap = {} as any
  animations: AnimationMap = {}
  configs: any[] = []
  queue: any[] = []
  prevQueue: any[] = []
  onEndQueue: OnEnd[] = []
  runCount = 0

  getValues = () => this.values as { [K in keyof DS]: Animation<DS[K]>['node'] }

  /**
   * Update the controller by merging the given props into an array of tasks.
   * Individual tasks may be async and/or delayed.
   */
  update(updateProps: UpdateProps<DS>) {
    if (!updateProps) return this

    // Extract delay and the to-prop from props
    const { delay = 0, to, ...props } = interpolateTo(updateProps) as any

    // If config is either a function or an array, queue it up as is
    if (is.arr(to) || is.fun(to)) {
      this.queue.push({ ...props, delay, to })
    }
    // Otherwise go through each key since it could be delayed individually
    else if (to) {
      let ops: any[] = []
      Object.entries(to).forEach(([name, value]) => {
        // Merge entries with the same delay
        const dt = callProp(delay, name)
        const previous = ops[dt] || {}
        ops[dt] = {
          ...previous,
          ...props,
          delay: dt,
          to: { ...previous.to, [name]: value },
        }
        const hasFrom = is.obj(props.from) && !is.und(props.from[name])
        // Eagerly create an Animated node to be used during render.
        // When `from[name]` exists, the node is created by `_diff` instead.
        if (!hasFrom && !this.values[name]) {
          const node = is.arr(value)
            ? new AnimatedValueArray(value)
            : isAnimatableString(value)
            ? new AnimatedValue(0).interpolate({ output: [value, value] })
            : new AnimatedValue(value as any)

          // For `node` to be reused, an animation object must exist
          const animation: any = {
            node,
            animatedValues: toArray(node.getPayload()),
          }

          this.values[name] = node
          this.animations[name] = animation
        }
      })
      ops.forEach(op => this.queue.push(op))
    }

    // Sort queue, so that async calls go last
    this.queue.sort((a, b) => a.delay - b.delay)

    // Diff the reduced props immediately (they'll contain the from-prop and some config)
    if (hasKeys(props)) {
      this._diff(props)
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
      this.guid++
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
      this.props.onFrame(this.frames)
    }
    if (!isActive) {
      this._stop(true)
    }
  }

  destroy() {
    this.stop()
    this.props = {} as any
    this.merged = {} as any
    this.frames = {} as any
    this.values = {} as any
    this.animations = {}
    this.configs = []
  }

  // Add this controller to the frameloop
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

  private _stop(finished?: boolean) {
    this.idle = true
    stop(this)

    const { onEndQueue } = this
    if (onEndQueue.length) {
      this.onEndQueue = []
      onEndQueue.forEach(onEnd => onEnd(finished))
    }
  }

  // Execute the current queue of update props to our animations.
  private _flush(onEnd?: OnEnd) {
    const { prevQueue } = this

    // Updates can interrupt trailing queues, in that case we just merge values
    if (prevQueue.length) {
      const froms: any[] = []
      const goals: any[] = []
      prevQueue.forEach(({ from, to }) => {
        if (is.obj(from)) froms.push(from)
        if (is.obj(to)) goals.push(to)
      })
      prevQueue.length = 0

      // Update `this.merged` with new values
      if (froms.length) {
        this.merged = Object.assign({}, ...froms, this.merged, ...goals)
      } else if (goals.length) {
        Object.assign(this.merged, ...goals)
      }
    }

    // The guid helps when tracking frames, a new queue over an old one means an override.
    // We discard async calls in that case
    const guid = ++this.guid
    const queue = (this.prevQueue = this.queue)
    this.queue = prevQueue

    // Track the number of running animations.
    let runsLeft = queue.length
    this.runCount = runsLeft

    // Never assume that the last update always finishes last, since that's
    // not true when 2+ async updates have indeterminate durations.
    const onRunEnd = (finished?: boolean) => {
      if (guid === this.guid) {
        this.runCount--
      }
      if (--runsLeft) return
      if (onEnd) onEnd(finished)
      if (finished) {
        const { onRest } = this.props
        if (onRest && !this.runCount) {
          onRest(this.merged)
        }
      }
    }

    // Go through each entry and execute it
    queue.forEach(({ delay, ...props }) => {
      // Entries can be delayed, async, or immediate
      if (delay) {
        setTimeout(() => this._run(guid, props, onRunEnd), delay)
      } else {
        this._run(guid, props, onRunEnd)
      }
    })
  }

  // Add or update (possibly async) animations.
  private _run(guid: number, props: UpdateProps<DS>, onEnd?: OnEnd) {
    if (guid !== this.guid) {
      if (onEnd) onEnd(false)
      return
    }
    if (is.arr(props.to) || is.fun(props.to)) {
      this._runAsync(guid, props, onEnd)
    } else {
      this._diff(props)._start(onEnd)
    }
  }

  // Start an async chain or an async script.
  private _runAsync(guid: number, props: UpdateProps<DS>, onEnd?: OnEnd) {
    let queue = Promise.resolve()

    const { to } = props
    if (is.arr(to)) {
      to.forEach((p, i) => {
        queue = queue.then(() => {
          if (guid !== this.guid) return
          const fresh = { ...props, ...interpolateTo(p) }
          if (is.arr(fresh.config)) fresh.config = fresh.config[i]
          return new Promise<any>(r => this._diff(fresh)._start(r))
        })
      })
    } else if (is.fun(to)) {
      // Throw this to interrupt an infinite script
      const stopToken = {}

      let i = 0
      let last: Promise<any>
      queue = queue.then(() =>
        to(
          // next(props)
          p => {
            if (guid !== this.guid) throw stopToken
            const fresh = { ...props, ...interpolateTo(p) }
            if (is.arr(fresh.config)) fresh.config = fresh.config[i++]
            return (last = new Promise(r => this._diff(fresh)._start(r)))
          },
          // stop(finished)
          this.stop.bind(this)
        ).then(
          () => last,
          err => {
            if (err !== stopToken) throw err
          }
        )
      )
    }

    if (onEnd) {
      queue.then(() => onEnd(guid === this.guid))
    }
  }

  private _diff(props: UpdateProps<DS>) {
    Object.assign(this.props, props)
    let {
      from = {} as any,
      to = {} as any,
      config = {},
      reverse,
      attach,
      reset,
      immediate,
      onStart,
    } = this.props

    // Reverse values when requested
    if (reverse) [from, to] = [to, from]

    // True if any animation was updated
    let changed = false

    // The animations that are starting/restarting
    const started: string[] = []

    // Attachment handling, trailed springs can "attach" themselves to a previous spring
    const target = attach && attach(this)

    // The goal values of every key ever animated
    this.merged = { ...from, ...this.merged, ...to }

    // Reduces input { name: value } pairs into animation objects
    this.animations = Object.entries<any>(this.merged).reduce(
      (acc, [name, value]) => {
        const entry: Animation = acc[name] || {}
        let { node, animatedValues } = entry

        const currentValue = node && node.getValue()
        const goalValue = computeGoalValue(value)
        const toConfig = callProp(config, name)

        // When the goal value equals the current value, silently flag the
        // animation as done, as long as `reset` is falsy. Interpolated strings
        // also need their config updated and value set to 1.
        if (!reset && is.equ(goalValue, currentValue)) {
          if (node instanceof AnimatedInterpolation) {
            const [parent] = animatedValues
            parent.done = true
            parent.setValue(1, false)
            node.updateConfig({
              output: [goalValue, goalValue],
            })
          } else {
            animatedValues.forEach(v => (v.done = true))
          }
          changed = true
          acc[name] = {
            ...(entry as Animation),
            goalValue,
          }
        }
        // Animations are only updated when they were reset, they have a new
        // goal value, or their spring config was changed.
        else if (
          reset ||
          !is.equ(goalValue, entry.goalValue) ||
          !is.equ(toConfig, entry.config)
        ) {
          const isActive = !!animatedValues && animatedValues.some(v => !v.done)
          const isImmediate = callProp(immediate, name)

          // When `node` is falsy, this is the initial diff, which means the
          // goal value is omitted. The animation will start in the next diff.
          // Immediate animations are never passed to the `onStart` prop.
          if (node && !isImmediate) {
            started.push(name)
          }

          const isArray = is.arr(value)
          const isInterpolated = isAnimatableString(value)

          const fromValue = !is.und(from[name])
            ? computeGoalValue(from[name])
            : goalValue

          // Animatable strings use interpolation
          if (isInterpolated) {
            let input: AnimatedValue
            const output = [fromValue, goalValue]
            if (node instanceof AnimatedInterpolation) {
              input = animatedValues[0]

              if (!reset) output[0] = node.calc(input.value)
              node.updateConfig({ output })

              input.setValue(0, false)
              input.reset(isActive)
            } else {
              input = new AnimatedValue(0)
              node = input.interpolate({ output })
            }
            if (isImmediate) {
              input.setValue(1, false)
            }
          } else {
            // Convert values into Animated nodes (reusing nodes whenever possible)
            if (isArray) {
              if (node instanceof AnimatedValueArray) {
                animatedValues.forEach(node => node.reset(isActive))
              } else {
                node = new AnimatedValueArray(fromValue)
              }
            } else {
              if (node instanceof AnimatedValue) {
                node.reset(isActive)
              } else {
                node = new AnimatedValue(fromValue)
              }
            }
            if (reset || isImmediate) {
              node.setValue(isImmediate ? goalValue : fromValue, false)
            }
          }

          // Update the array of Animated nodes used by the frameloop
          animatedValues = toArray(node.getPayload() as any)

          changed = true
          acc[name] = {
            name,
            node,
            immediate: isImmediate,
            goalValue,
            toValues: toArray(
              target
                ? target.animations[name].node.getPayload()
                : (isInterpolated && 1) || goalValue
            ),
            fromValues: animatedValues.map(node => node.getValue()),
            animatedValues,
            mass: withDefault(toConfig.mass, 1),
            tension: withDefault(toConfig.tension, 170),
            friction: withDefault(toConfig.friction, 26),
            initialVelocity: withDefault(toConfig.velocity, 0),
            clamp: withDefault(toConfig.clamp, false),
            precision: withDefault(toConfig.precision, 0.01),
            decay: toConfig.decay,
            duration: toConfig.duration,
            easing: withDefault(toConfig.easing, linear),
            config: toConfig,
          }
        }
        return acc
      },
      this.animations
    )

    if (changed) {
      if (onStart && started.length) {
        started.forEach(name => onStart!(this.animations[name]))
      }

      const frames = (this.frames = {} as any)
      const values = (this.values = {} as any)
      for (const key in this.animations) {
        const { node } = this.animations[key]
        frames[key] = node.getValue()
        values[key] = node
      }

      // Make animations available to frameloop
      this.configs = Object.values(this.animations)
    }
    return this
  }
}

// Not all strings can be animated (eg: {display: "none"})
function isAnimatableString(value: unknown): value is string {
  if (!is.str(value)) return false
  return value.startsWith('#') || /\d/.test(value) || !!colorNames[value]
}

// Compute the goal value, converting "red" to "rgba(255, 0, 0, 1)" in the process
function computeGoalValue(value: any): any {
  return is.arr(value)
    ? value.map(computeGoalValue)
    : isAnimatableString(value)
    ? interp({ range: [0, 1], output: [value, value] })(1)
    : value
}

export default Controller
