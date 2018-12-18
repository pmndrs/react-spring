import Animated from './Animated'
import AnimatedValue from './AnimatedValue'
import AnimatedArray from './AnimatedArray'
import { colorNames, now, requestFrame, cancelFrame } from './Globals'
import {
  interpolateTo,
  withDefault,
  toArray,
  getValues,
  callProp,
  shallowEqual,
} from '../shared/helpers'

let time,
  isDone,
  isAnimated,
  noChange,
  configIdx,
  valIdx,
  config,
  animation,
  position,
  from,
  to,
  endOfAnimation,
  lastTime,
  velocity,
  numSteps,
  force,
  damping,
  acceleration,
  stepIdx,
  isOvershooting,
  isVelocity,
  isDisplacement

export default class Controller {
  constructor(
    props,
    config = { native: true, interpolateTo: true, autoStart: true }
  ) {
    this.dependents = new Set()
    this.isActive = false
    this.hasChanged = false
    this.props = {}
    this.merged = {}
    this.animations = {}
    this.interpolations = {}
    this.animatedProps = {}
    this.configs = []
    this.frame = undefined
    this.startTime = undefined
    this.lastTime = undefined
    this.update({ ...props, ...config })
  }

  update(props, ...start) {
    this.props = { ...this.props, ...props }
    let {
      from = {},
      to = {},
      config = {},
      delay = 0,
      reverse,
      attach,
      reset,
      immediate,
      autoStart,
      ref,
    } = this.props.interpolateTo ? interpolateTo(this.props) : this.props

    // Reverse values when requested
    if (reverse) {
      ;[from, to] = [to, from]
    }
    this.hasChanged = false
    // Attachment handling, trailed springs can "attach" themselves to a previous spring
    let target = attach && attach(this)

    // Reset merged props when necessary
    let extra = reset ? {} : this.merged
    // This will collect all props that were ever set
    this.merged = { ...from, ...extra, ...to }
    // Reduces input { name: value } pairs into animated values
    this.animations = Object.entries(this.merged).reduce(
      (acc, [name, value], i) => {
        // Issue cached entries, except on reset
        let entry = (!reset && acc[name]) || {}

        // Figure out what the value is supposed to be
        const isNumber = typeof value === 'number'
        const isString =
          typeof value === 'string' &&
          !value.startsWith('#') &&
          !/\d/.test(value) &&
          !colorNames[value]
        const isArray = !isNumber && !isString && Array.isArray(value)

        let fromValue = from[name] !== undefined ? from[name] : value
        let toValue = isNumber || isArray ? value : isString ? value : 1
        let toConfig = callProp(config, name)
        if (target) toValue = target.animations[name].parent

        // Detect changes, animated values will be checked in the raf-loop
        if (!shallowEqual(entry.changes, value)) {
          this.hasChanged = true

          let parent, interpolation
          if (isNumber || isString)
            parent = interpolation =
              entry.parent || new AnimatedValue(fromValue)
          else if (isArray)
            parent = interpolation =
              entry.parent || new AnimatedArray(fromValue)
          else {
            const prev =
              entry.interpolation &&
              entry.interpolation.calc(entry.parent.value)
            if (entry.parent) {
              parent = entry.parent
              parent.setValue(0)
            } else parent = new AnimatedValue(0)
            const range = {
              output: [prev !== void 0 ? prev : fromValue, value],
            }
            if (entry.interpolation) {
              interpolation = entry.interpolation
              entry.interpolation.updateConfig(range)
            } else interpolation = parent.interpolate(range)
          }

          // Set immediate values
          if (callProp(immediate, name)) parent.setValue(value)

          // Reset animated values
          const animatedValues = toArray(parent.getPayload())
          animatedValues.forEach(value => value.prepare(this))

          return {
            ...acc,
            [name]: {
              ...entry,
              name,
              parent,
              interpolation,
              changes: value,
              animatedValues,
              fromValues: toArray(parent.getValue()),
              toValues: toArray(target ? toValue.getPayload() : toValue),
              immediate: callProp(immediate, name),
              delay: withDefault(toConfig.delay, delay || 0),
              initialVelocity: withDefault(toConfig.velocity, 0),
              clamp: withDefault(toConfig.clamp, false),
              precision: withDefault(toConfig.precision, 0.01),
              tension: withDefault(toConfig.tension, 170),
              friction: withDefault(toConfig.friction, 26),
              mass: withDefault(toConfig.mass, 1),
              duration: toConfig.duration,
              easing: withDefault(toConfig.easing, t => t),
            },
          }
        } else return acc
      },
      this.animations
    )

    if (this.hasChanged) {
      this.configs = getValues(this.animations)
      this.animatedProps = {}
      this.interpolations = {}
      for (let key in this.animations) {
        this.interpolations[key] = this.animations[key].interpolation
        this.animatedProps[key] = this.animations[key].interpolation.getValue()
      }
    }

    // TODO: clean up ref in controller
    if (!ref && (autoStart || start.length)) this.start(...start)

    const [onEnd, onUpdate] = start
    this.onEnd = typeof onEnd === 'function' && onEnd
    this.onUpdate = onUpdate

    return this.getValues()
  }

  start(onEnd, onUpdate) {
    this.startTime = now()
    if (this.isActive) this.stop()

    this.isActive = true
    this.onEnd = typeof onEnd === 'function' && onEnd
    this.onUpdate = onUpdate

    if (this.props.onStart) this.props.onStart()
    // Start RAF loop
    this.frame = requestFrame(this.raf)

    return new Promise(res => (this.resolve = res))
  }

  stop(finished = false) {
    config = undefined
    animation = undefined
    from = undefined
    to = undefined
    // Reset collected changes since the animation has been stopped cold turkey
    if (finished)
      getValues(this.animations).forEach(a => (a.changes = undefined))
    this.isActive = false
    cancelFrame(this.frame)
    this.debouncedOnEnd({ finished })
  }

  debouncedOnEnd(result) {
    this.isActive = false
    const onEnd = this.onEnd
    this.onEnd = null
    onEnd && onEnd(result)
    if (this.resolve) this.resolve()
  }

  getValues = () =>
    this.props.native ? this.interpolations : this.animatedProps

  raf = () => {
    time = now()
    isDone = true
    noChange = true

    for (configIdx = 0; configIdx < this.configs.length; configIdx++) {
      config = this.configs[configIdx]

      // Doing delay here instead of setTimeout is one async worry less
      if (config.delay && time - this.startTime < config.delay) {
        isDone = false
        continue
      }

      for (valIdx = 0; valIdx < config.animatedValues.length; valIdx++) {
        animation = config.animatedValues[valIdx]
        position = animation.lastPosition
        from = config.fromValues[valIdx]
        to = config.toValues[valIdx]
        isAnimated = to instanceof Animated
        if (isAnimated) to = to.getValue()

        // If an animation is done, skip, until all of them conclude
        if (animation.done) continue

        // Break animation when animation is immediate or string values are involved
        if (
          config.immediate ||
          typeof from === 'string' ||
          typeof to === 'string'
        ) {
          animation.updateValue(to)
          animation.done = true
          continue
        } else noChange = false

        if (config.duration !== void 0) {
          position =
            from +
            config.easing(
              (time - this.startTime - config.delay) / config.duration
            ) *
              (to - from)
          endOfAnimation =
            time >= this.startTime + config.delay + config.duration
        } else {
          lastTime = animation.lastTime !== void 0 ? animation.lastTime : time
          velocity =
            animation.lastVelocity !== void 0
              ? animation.lastVelocity
              : config.initialVelocity

          // If we lost a lot of frames just jump to the end.
          if (time > lastTime + 64) lastTime = time
          // http://gafferongames.com/game-physics/fix-your-timestep/
          numSteps = Math.floor(time - lastTime)
          for (stepIdx = 0; stepIdx < numSteps; ++stepIdx) {
            force = -config.tension * (position - to)
            damping = -config.friction * velocity
            acceleration = (force + damping) / config.mass
            velocity = velocity + (acceleration * 1) / 1000
            position = position + (velocity * 1) / 1000
          }

          // Conditions for stopping the spring animation
          isOvershooting =
            config.clamp && config.tension !== 0
              ? from < to
                ? position > to
                : position < to
              : false
          isVelocity = Math.abs(velocity) <= config.precision
          isDisplacement =
            config.tension !== 0
              ? Math.abs(to - position) <= config.precision
              : true
          endOfAnimation = isOvershooting || (isVelocity && isDisplacement)
          animation.lastVelocity = velocity
          animation.lastTime = time
        }

        // Trails aren't done until their parents conclude
        if (isAnimated && !config.toValues[valIdx].done) endOfAnimation = false

        if (endOfAnimation) {
          // Ensure that we end up with a round value
          if (animation.value !== to) position = to
          animation.done = true
        } else isDone = false

        animation.updateValue(position)
        animation.lastPosition = position
      }

      // Keep track of updated values only when necessary
      if (this.props.onFrame || !this.props.native)
        this.animatedProps[config.name] = config.interpolation.getValue()
    }
    // Update callbacks in the end of the frame
    if (this.props.onFrame || !this.props.native) {
      if (!this.props.native && this.onUpdate) this.onUpdate()
      if (this.props.onFrame) this.props.onFrame(this.animatedProps)
    }
    // Either call onEnd or next frame
    if (isDone) return this.debouncedOnEnd({ finished: true, noChange })
    this.frame = requestFrame(this.raf)
  }
}
