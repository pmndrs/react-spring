import Animated from './Animated'
import AnimatedValue from './AnimatedValue'
import AnimatedArray from './AnimatedArray'
import AnimatedProps from './AnimatedProps'
import * as Globals from './Globals'
import {
  interpolateTo,
  withDefault,
  toArray,
  getValues,
  callProp,
  shallowEqual,
} from '../shared/helpers'

let now,
  isDone,
  noChange,
  configIdx,
  valIdx,
  config,
  animation,
  position,
  from,
  tracked,
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
    config = { native: true, track: true, interpolateTo: true, autoStart: true }
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

  /**
   * props: to: { ... }
   *
   *  { name: value }             pairs
   *  { name: AnimatedValue() }   animated values
   *  { name: [1,2,3] }           plain numeric arrays
   *  { name: AnimatedArray() }   animated arrays
   *
   * Plain values can be:
   *
   *  123                         Numbers
   *  "hello"                     Strings
   *  "#3d4d5d" ...               Colors (rga, rgba, hex, plain names)
   *  "something 12 something"    Interpolation patterns with numbers in them
   *
   * Additionally, springs are allowed to "attach" to another AnimationController, fetching the
   * values from there, if present.
   */
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
      native,
      onFrame,
      track,
      autoStart,
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
        // Attach allows a spring to fetch its values elsewhere
        let _value = value,
          _entry
        if (target && target.animations[name]) {
          _entry = target.animations[name]
          value = _entry.parent
        }

        // Figure out what the value is supposed to be
        let isArray, isString, isNumber, isInterpolation
        let isAnimated = value instanceof Animated
        if (!isAnimated) {
          isArray = Array.isArray(value)
          isNumber = typeof value === 'number'
          isString =
            typeof value === 'string' &&
            !value.startsWith('#') &&
            !/\d/.test(value) &&
            !Globals.colorNames[value]
          isInterpolation = !isNumber && !isString && !isArray
        }

        // Carry actual values (including animated) in order to change detect
        const changes = isAnimated ? value.getPayload() : value

        // Detect changes, animated values will be checked in the raf-loop
        if (isAnimated || !shallowEqual(entry.changes, changes)) {
          this.hasChanged = true

          let parent, interpolation
          let _from = from[name] !== void 0 ? from[name] : value
          let _config = callProp(config, name)

          if (isAnimated) {
            // We end up here if the value we're shifting to is an animated value or array
            parent = entry.parent || new value.constructor(value.getValue())
            interpolation = entry.interpolation || parent

            // In the next step we're going to check if that value is interpolated
            if (_entry && _entry.interpolation.calc) {
              const config = {
                output: [
                  interpolation.calc
                    ? interpolation.calc(parent.value)
                    : _entry.interpolation.calc(0),
                  _value,
                ],
              }
              if (interpolation.calc) interpolation.updateConfig(config)
              else interpolation = parent.interpolate(config)
              parent.value = 0
            }
          } else if (isNumber || isString) {
            parent = interpolation = entry.parent || new AnimatedValue(_from)
          } else if (isArray) {
            parent = interpolation = entry.parent || new AnimatedArray(_from)
          } else if (isInterpolation) {
            // Deal with interpolations
            const prev =
              entry.interpolation &&
              entry.interpolation.calc(entry.parent.value)
            // Interpolations are not addaptive, start with 0
            if (entry.parent) {
              parent = entry.parent
              parent.value = 0
            } else parent = new AnimatedValue(0)
            // Map from-to on a scale between 0-1
            const range = { output: [prev !== void 0 ? prev : _from, value] }
            if (entry.interpolation) {
              interpolation = entry.interpolation
              entry.interpolation.updateConfig(range)
            } else interpolation = parent.interpolate(range)

            // And stop at 1
            value = 1
          }

          parent.controller = this
          if (isAnimated && value.controller !== this)
            value.controller.dependents.add(this)
          parent.track = isAnimated ? value : undefined

          // Set immediate values
          //if (callProp(immediate, name)) parent.value = value

          // Map output values to an array so reading out is easier later on
          const animatedValues = toArray(parent.getPayload())
          const fromValues = toArray(parent.getValue())
          const toValues = toArray(isAnimated ? value.getValue() : value)

          // Reset animated values
          animatedValues.forEach(value => value.prepare(this))

          return {
            ...acc,
            [name]: {
              ...entry,
              name,
              parent, // The animated object on which the update-cb is called
              interpolation, // The parents interpolation, if any. If not it refers to the parent
              animatedValues, // An array of all animated values taking part in this op
              fromValues, // Raw/numerical start-state values
              toValues, // Raw/numerical/end-state values
              changes,
              immediate: callProp(immediate, name),
              delay: withDefault(_config.delay, delay || 0),
              initialVelocity: withDefault(_config.velocity, 0),
              clamp: withDefault(_config.clamp, false),
              precision: withDefault(_config.precision, 0.01),
              tension: withDefault(_config.tension, 170),
              friction: withDefault(_config.friction, 26),
              mass: withDefault(_config.mass, 1),
              duration: withDefault(_config.duration, 0),
              easing: withDefault(_config.easing, t => t),
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
    if (autoStart || start.length) this.start(...start)

    return this.getValues()
  }

  start(onEnd, onUpdate) {
    this.startTime = Globals.now()
    if (this.isActive) this.stop()

    this.isActive = true
    this.onEnd = typeof onEnd === 'function' && onEnd
    this.onUpdate = onUpdate

    if (this.props.onStart) this.props.onStart()
    // Start RAF loop
    this.frame = Globals.requestFrame(this.raf)

    // Call dependent controllers
    if (this.props.track)
      for (let controller of this.dependents)
        controller.update({ ...controller.props, ...controller.merged }, true)
  }

  stop(finished = false) {
    config = undefined
    animation = undefined
    from = undefined
    tracked = undefined
    to = undefined
    // Reset collected changes since the animation has been stopped cold turkey
    if (finished)
      getValues(this.animations).forEach(a => (a.changes = undefined))
    this.isActive = false
    Globals.cancelFrame(this.frame)
    this.debouncedOnEnd({ finished })
  }

  debouncedOnEnd(result) {
    this.isActive = false
    const onEnd = this.onEnd
    this.onEnd = null
    onEnd && onEnd(result)
  }

  getValues = () =>
    this.props.native ? this.interpolations : this.animatedProps

  raf = () => {
    now = Globals.now()
    isDone = true
    noChange = true

    for (configIdx = 0; configIdx < this.configs.length; configIdx++) {
      config = this.configs[configIdx]

      // Doing delay here instead of setTimeout is one async worry less
      if (config.delay && now - this.startTime < config.delay) {
        isDone = false
        continue
      }

      for (valIdx = 0; valIdx < config.animatedValues.length; valIdx++) {
        animation = config.animatedValues[valIdx]
        position = animation.lastPosition
        from = config.fromValues[valIdx]
        tracked = config.parent.track && config.parent.track.getPayload(valIdx)
        to = tracked ? tracked.getValue() : config.toValues[valIdx]

        // If an animation is done, skip, until all of them conclude
        if (animation.done) continue

        // Break animation when animation is immediate or string values are involved
        if (config.immediate || typeof from === 'string' || typeof to === 'string') {
          animation.updateValue(to)
          animation.done = true
          continue
        } else noChange = false

        if (config.duration) {
          position =
            from +
            config.easing(
              (now - this.startTime - config.delay) / config.duration
            ) *
              (to - from)
          endOfAnimation =
            now >= this.startTime + config.delay + config.duration
        } else {
          lastTime = animation.lastTime !== void 0 ? animation.lastTime : now
          velocity =
            animation.lastVelocity !== void 0
              ? animation.lastVelocity
              : config.initialVelocity

          // If we lost a lot of frames just jump to the end.
          if (now > lastTime + 64) lastTime = now
          // http://gafferongames.com/game-physics/fix-your-timestep/
          numSteps = Math.floor(now - lastTime)
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
          animation.lastTime = now
        }

        // Trails aren't done until their parents conclude
        if (config.parent.track && !tracked.done) endOfAnimation = false

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
    this.frame = Globals.requestFrame(this.raf)
  }
}
