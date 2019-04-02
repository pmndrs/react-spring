import {
  callProp,
  interpolateTo,
  is,
  toArray,
  withDefault,
  hasKeys,
} from '../shared/helpers'
import Animated from './Animated'
import AnimatedValue from './AnimatedValue'
import AnimatedValueArray from './AnimatedValueArray'
import AnimatedInterpolation from './AnimatedInterpolation'
import { start, stop } from './FrameLoop'
import { colorNames, interpolation as interp } from './Globals'
import { SpringProps, SpringConfig } from '../../types/renderprops'

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

interface Animation<T> extends Omit<SpringConfig, 'velocity'> {
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

type AnimationMap = { [name: string]: Animation<any> }
type AnimatedMap<DS> = { [K in keyof DS]: Animated<DS[K]> }

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
  values: DS = {} as any
  nodes: AnimatedMap<DS> = {} as any
  animations: AnimationMap = {}
  configs: any[] = []
  queue: any[] = []
  prevQueue: any[] = []
  onEndQueue: OnEnd[] = []
  pendingCount = 0

  getValues = () => this.nodes

  /**
   * Update the controller by merging the given props into an array of tasks.
   * Individual tasks may be async and/or delayed.
   */
  update(props: UpdateProps<DS>) {
    // Extract delay and the to-prop from props
    const { delay = 0, to, ...restProps } = interpolateTo(props) as any

    // If config is either a function or an array, queue it up as is
    if (is.arr(to) || is.fun(to)) {
      this.queue.push({ ...restProps, delay, to })
    }
    // Otherwise go through each key since it could be delayed individually
    else if (to) {
      let ops: any[] = []
      Object.entries(to).forEach(([k, v]) => {
        // Merge entries with the same delay
        const dt = callProp(delay, k)
        const previous = ops[dt] || {}
        ops[dt] = {
          ...previous,
          ...restProps,
          delay: dt,
          to: { ...previous.to, [k]: v },
        }
      })
      ops.forEach(op => this.queue.push(op))
    }

    // Sort queue, so that async calls go last
    this.queue.sort((a, b) => a.delay - b.delay)

    // Diff the reduced props immediately (they'll contain the from-prop and some config)
    if (hasKeys(restProps)) this._diff(restProps)

    return this
  }

  /**
   * Execute any queued updates, else make sure the frameloop is running.
   * The `useSpring` hooks never have > 1 update per call, because they call this every render.
   */
  start(onEnd?: OnEnd) {
    // If a queue is present we must execute it
    if (this.queue.length) {
      const { prevQueue } = this

      // Updates can interrupt trailing queues, in that case we just merge values
      if (prevQueue.length) {
        prevQueue.forEach(({ from, to }) => {
          if (is.obj(from)) this.merged = { ...from, ...this.merged }
          if (is.obj(to)) this.merged = { ...this.merged, ...to }
        })
        // Reset any queue-related state
        prevQueue.length = 0
        this.pendingCount = 0
        this.onEndQueue.length = 0
      }

      // The guid helps when tracking frames, a new queue over an old one means an override.
      // We discard async calls in that case
      const guid = ++this.guid
      const queue = (this.prevQueue = this.queue)
      this.queue = prevQueue

      // Never assume that the last update always finishes last, since that's
      // not true when 2+ async updates have indeterminate durations.
      let remaining = queue.length
      const didEnd =
        onEnd &&
        ((finished?: boolean) => {
          if (--remaining === 0) onEnd(finished)
        })

      // Go through each entry and execute it
      queue.forEach(({ delay, ...props }) => {
        // Entries can be delayed, async, or immediate
        if (delay) {
          this.pendingCount++
          setTimeout(() => {
            if (guid === this.guid) {
              this.pendingCount--
              this._run(guid, props, didEnd)
            }
          }, delay)
        } else {
          this._run(guid, props, didEnd)
        }
      })
    }
    // Otherwise ensure the frameloop is active
    else this._start(onEnd)
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

  stop(finished?: boolean) {
    if (!this.idle || this.pendingCount) {
      this.guid++
      this._stop(finished)
      this.pendingCount = 0
    }
    return this
  }

  destroy() {
    this.stop()
    this.props = {} as any
    this.merged = {} as any
    this.values = {} as any
    this.nodes = {} as any
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
    if (finished && this.props.onRest) {
      this.props.onRest(this.merged)
    }
    if (this.onEndQueue.length) {
      this.onEndQueue.forEach(onEnd => onEnd(finished))
      this.onEndQueue = []
    }
  }

  private _run(guid: number, props: UpdateProps<DS>, onEnd?: OnEnd) {
    // Never call `onStart` for immediate animations
    if (!props.immediate) {
      const { onStart } = props
      // Allow `useCallback` to prevent multiple calls
      if (onStart && onStart !== this.props.onStart) onStart()
    }
    if (is.arr(props.to) || is.fun(props.to)) {
      this._runAsync(guid, props, onEnd)
    } else {
      this._diff(props)._start(onEnd)
    }
  }

  private _runAsync(guid: number, props: UpdateProps<DS>, onEnd?: OnEnd) {
    // If "to" is either a function or an array it will be processed async, therefor "to" should be empty right now
    // If the view relies on certain values "from" has to be present
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
      let i = 0
      let last: Promise<any>
      queue = queue.then(() =>
        to(
          // next(props)
          p => {
            if (guid !== this.guid) return
            const fresh = { ...props, ...interpolateTo(p) }
            if (is.arr(fresh.config)) fresh.config = fresh.config[i++]
            return (last = new Promise(r => this._diff(fresh)._start(r)))
          },
          // cancel()
          finished => this.stop(finished)
        ).then(() => last)
      )
    }

    this.pendingCount++
    queue.then(() => {
      if (guid === this.guid) {
        this.pendingCount--
        if (onEnd) onEnd(true)
      }
    })
  }

  private _diff(props: UpdateProps<DS>) {
    this.props = { ...this.props, ...props }
    let {
      from = {} as any,
      to = {} as any,
      config = {},
      reverse,
      attach,
      reset,
      immediate,
    } = this.props

    // Reverse values when requested
    if (reverse) {
      ;[from, to] = [to, from]
    }

    // This will collect all props that were ever set, reset merged props when necessary
    this.merged = { ...from, ...this.merged, ...to }

    // Attachment handling, trailed springs can "attach" themselves to a previous spring
    let target = attach && attach(this)

    // Detect when no animations are changed
    let changed = false

    // Reduces input { name: value } pairs into animated values
    this.animations = Object.entries<any>(this.merged).reduce(
      (acc, [name, value]) => {
        // Issue cached entries, except on reset
        const entry: Animation<any> = acc[name] || {}
        let { node, animatedValues } = entry

        const currentValue = node && node.getValue()
        const goalValue = computeGoalValue(value)
        const toConfig = callProp(config, name)

        // When the goal value equals the current value, silently flag the
        // animation as done, as long as `reset` is falsy. Interpolated strings
        // also need their config updated and value set to 1.
        if (!reset && is.equ(goalValue, currentValue)) {
          changed = true
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
          acc[name] = {
            ...(entry as Animation<any>),
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

          const isArray = is.arr(value)
          const isInterpolated = isAnimatableString(value)

          const fromValue = !is.und(from[name]) ? from[name] : value
          const toValue = target
            ? target.animations[name].node
            : (isInterpolated && 1) || value

          // Animatable strings use interpolation
          if (isInterpolated) {
            let parent: AnimatedValue
            const output = [fromValue, goalValue]
            if (node instanceof AnimatedInterpolation) {
              parent = animatedValues[0]

              if (!reset) output[0] = node.calc(parent.value)
              node.updateConfig({ output })

              parent.reset(isActive)
              parent.setValue(0, false)
            } else {
              parent = new AnimatedValue(0)
              node = parent.interpolate({ output })
            }
            if (isImmediate) {
              parent.setValue(toValue, false)
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
              node.setValue(reset ? fromValue : goalValue, false)
            }
          }

          changed = true
          acc[name] = {
            ...entry,
            name,
            node,
            immediate: isImmediate,
            goalValue,
            toValues: toArray(target ? toValue.getPayload() : toValue),
            fromValues: toArray(node.getValue()),
            animatedValues: toArray(node.getPayload() as any),
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
      const values = (this.values = {} as any)
      const nodes = (this.nodes = {} as any)
      for (const key in this.animations) {
        const { node } = this.animations[key]
        values[key] = node.getValue()
        nodes[key] = node
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
  return value.startsWith('#') || /^\d/.test(value) || !!colorNames[value]
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
