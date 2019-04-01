import {
  callProp,
  interpolateTo,
  is,
  toArray,
  withDefault,
  hasKeys,
} from '../shared/helpers'
import AnimatedValue from './AnimatedValue'
import AnimatedValueArray from './AnimatedValueArray'
import { start, stop } from './FrameLoop'
import { colorNames, interpolation as interp, now } from './Globals'
import { SpringProps } from '../../types/renderprops'

type Animation = any

type ControllerProps<DS extends object> = DS &
  SpringProps<DS> & {
    attach?: (ctrl: Controller) => Animation
  }

type AnimationsFor<P> = { [Key in keyof P]: any }

type ValuesFor<P> = { [Key in keyof P]: any }

type InterpolationsFor<DS> = {
  [K in keyof DS]: DS[K] extends ArrayLike<any>
    ? AnimatedValueArray
    : AnimatedValue
}

type EndCallback = (finished?: boolean) => void

let nextId = 1
class Controller<DS extends object = any> {
  id = nextId++
  idle = true
  guid = 0
  props: ControllerProps<DS> = {} as any
  merged: any = {}
  animations = {} as AnimationsFor<DS>
  interpolations = {} as InterpolationsFor<DS>
  values = {} as ValuesFor<DS>
  configs: any = []
  queue: any[] = []
  prevQueue: any[] = []
  onEndQueue: EndCallback[] = []
  pendingCount = 0

  // Add this controller to the frameloop
  private _start(onEnd?: EndCallback) {
    if (onEnd) this.onEndQueue.push(onEnd)
    if (this.idle) {
      this.idle = false
      start(this)
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

  /** update(props)
   *  This function filters input props and creates an array of tasks which are executed in .start()
   *  Each task is allowed to carry a delay, which means it can execute asnychroneously */
  update(args: ControllerProps<DS>) {
    // Extract delay and the to-prop from props
    const { delay = 0, to, ...props } = interpolateTo(args) as any

    // If config is either a function or an array, queue it up as is
    if (is.arr(to) || is.fun(to)) {
      this.queue.push({ ...props, delay, to })
    }
    // Otherwise go through each key since it could be delayed individually
    else if (to) {
      let ops: any[] = []
      Object.entries(to).forEach(([k, v]) => {
        // Fetch delay and create an entry, consisting of the to-props, the delay, and basic props
        const entry = { to: { [k]: v }, delay: callProp(delay, k), ...props }
        const previous = ops[entry.delay] && ops[entry.delay].to
        ops[entry.delay] = {
          ...ops[entry.delay],
          ...entry,
          to: { ...previous, ...entry.to },
        }
      })
      ops.forEach(op => this.queue.push(op))
    }

    // Sort queue, so that async calls go last
    this.queue.sort((a, b) => a.delay - b.delay)

    // Diff the reduced props immediately (they'll contain the from-prop and some config)
    if (hasKeys(props)) this.diff(props)

    return this
  }

  /** start()
   *  This function either executes a queue, if present, or starts the frameloop, which animates.
   *  The `useSpring` hooks never have > 1 update per call, because they call this every render. */
  start(onEnd?: EndCallback) {
    // If a queue is present we must execute it
    if (this.queue.length) {
      const { prevQueue } = this

      // Updates can interrupt trailing queues, in that case we just merge values
      if (prevQueue.length) {
        prevQueue.forEach(({ from, to }) => {
          if (is.obj(from)) this.merged = { ...from, ...this.merged }
          if (is.obj(to)) this.merged = { ...this.merged, ...to }
        })
        prevQueue.length = 0
      }

      // The guid helps when tracking frames, a new queue over an old one means an override.
      // We discard async calls in that case
      const guid = ++this.guid
      const queue = (this.prevQueue = this.queue)
      this.queue = prevQueue

      // Reset delay/async tracking
      this.pendingCount = 0

      // Go through each entry and execute it
      queue.forEach(({ delay, onStart, ...props }) => {
        // Entries can be delayed, async, or immediate
        const async = is.arr(props.to) || is.fun(props.to)
        if (delay) {
          this.pendingCount++
          setTimeout(() => {
            if (guid === this.guid) {
              this.pendingCount--
              if (async) this.runAsync(guid, props, onEnd)
              else this.diff(props)._start(onEnd)
            }
          }, delay)
        } else {
          if (async) this.runAsync(guid, props, onEnd)
          else this.diff(props)._start(onEnd)
        }
      })
    }
    // Otherwise ensure the frameloop is active
    else this._start(onEnd)
    return this
  }

  stop(finished?: boolean) {
    if (!this.idle || this.pendingCount) {
      this.guid++
      this._stop(finished)
      this.pendingCount = 0
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

  runAsync(
    guid: number,
    props: SpringProps<DS>,
    onEnd?: (finished: boolean) => void
  ) {
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
          return new Promise<any>(r => this.diff(fresh).start(r))
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
            return (last = new Promise(r => this.diff(fresh).start(r)))
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

  diff(props: any) {
    this.props = { ...this.props, ...props }
    let {
      from = {},
      to = {},
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
        let entry = acc[name] || {}

        // Figure out what the value is supposed to be
        const isNumber = is.num(value)
        const isString =
          is.str(value) &&
          !value.startsWith('#') &&
          !/\d/.test(value) &&
          !colorNames[value]
        const isArray = is.arr(value)
        const isInterpolation = !isNumber && !isArray && !isString

        let fromValue = !is.und(from[name]) ? from[name] : value
        let toValue = isNumber || isArray ? value : isString ? value : 1
        let toConfig = callProp(config, name)
        if (target) toValue = target.animations[name].parent

        let parent = entry.parent,
          interpolation = entry.interpolation,
          toValues = toArray(target ? toValue.getPayload() : toValue),
          animatedValues

        let newValue = value
        if (isInterpolation)
          newValue = interp({
            range: [0, 1],
            output: [value as string, value as string],
          })(1)
        let currentValue = interpolation && interpolation.getValue()

        // Change detection flags
        const isFirst = is.und(parent)
        const isActive =
          !isFirst && entry.animatedValues.some((v: AnimatedValue) => !v.done)
        const currentValueDiffersFromGoal = !is.equ(newValue, currentValue)
        const hasNewGoal = !is.equ(newValue, entry.previous)
        const hasNewConfig = !is.equ(toConfig, entry.config)

        // Change animation props when props indicate a new goal (new value differs from previous one)
        // and current values differ from it. Config changes trigger a new update as well (though probably shouldn't?)
        if (
          reset ||
          (hasNewGoal && currentValueDiffersFromGoal) ||
          hasNewConfig
        ) {
          // Convert regular values into animated values, ALWAYS re-use if possible
          if (isNumber || isString)
            parent = interpolation =
              entry.parent || new AnimatedValue(fromValue)
          else if (isArray)
            parent = interpolation =
              entry.parent || new AnimatedValueArray(fromValue)
          else if (isInterpolation) {
            let prev =
              entry.interpolation &&
              entry.interpolation.calc(entry.parent.value)
            prev = prev !== void 0 && !reset ? prev : fromValue
            if (entry.parent) {
              parent = entry.parent
              parent.setValue(0, false)
            } else parent = new AnimatedValue(0)
            const range = { output: [prev, value] }
            if (entry.interpolation) {
              interpolation = entry.interpolation
              entry.interpolation.updateConfig(range)
            } else interpolation = parent.interpolate(range)
          }

          toValues = toArray(target ? toValue.getPayload() : toValue)
          animatedValues = toArray(parent.getPayload())
          if (reset && !isInterpolation) parent.setValue(fromValue, false)

          // Reset animated values
          animatedValues.forEach(value => {
            value.startPosition = value.value
            value.lastPosition = value.value
            value.lastVelocity = isActive ? value.lastVelocity : undefined
            value.lastTime = isActive ? value.lastTime : undefined
            value.startTime = now()
            value.done = false
            value.animatedStyles.clear()
          })

          // Set immediate values
          if (callProp(immediate, name)) {
            parent.setValue(isInterpolation ? toValue : value, false)
          }

          changed = true
          acc[name] = {
            ...entry,
            name,
            parent,
            interpolation,
            animatedValues,
            toValues,
            previous: newValue,
            config: toConfig,
            fromValues: toArray(parent.getValue()),
            immediate: callProp(immediate, name),
            initialVelocity: withDefault(toConfig.velocity, 0),
            clamp: withDefault(toConfig.clamp, false),
            precision: withDefault(toConfig.precision, 0.01),
            tension: withDefault(toConfig.tension, 170),
            friction: withDefault(toConfig.friction, 26),
            mass: withDefault(toConfig.mass, 1),
            duration: toConfig.duration,
            easing: withDefault(toConfig.easing, (t: number) => t),
            decay: toConfig.decay,
          }
        } else if (!currentValueDiffersFromGoal) {
          // So ... the current target value (newValue) appears to be different from the previous value,
          // which normally constitutes an update, but the actual value (currentValue) matches the target!
          // In order to resolve this without causing an animation update we silently flag the animation as done,
          // which it technically is. Interpolations also needs a config update with their target set to 1.
          if (isInterpolation) {
            parent.setValue(1, false)
            interpolation.updateConfig({ output: [newValue, newValue] })
          }

          changed = true
          parent.done = true
          acc[name] = { ...entry, previous: newValue }
        }
        return acc
      },
      this.animations
    )

    if (changed) {
      // Make animations available to frameloop
      this.configs = Object.values(this.animations)
      this.values = {} as ValuesFor<DS>
      this.interpolations = {} as InterpolationsFor<DS>
      for (let key in this.animations) {
        this.interpolations[key] = this.animations[key].interpolation
        this.values[key] = this.animations[key].interpolation.getValue()
      }
    }
    return this
  }

  destroy() {
    this.stop()
    this.props = {} as DS
    this.merged = {}
    this.animations = {} as AnimationsFor<DS>
    this.interpolations = {} as InterpolationsFor<DS>
    this.values = {} as ValuesFor<DS>
    this.configs = []
  }

  getValues = () => this.interpolations
}

export default Controller
