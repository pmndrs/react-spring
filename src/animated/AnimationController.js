import Animated from './Animated'
import AnimatedValue from './AnimatedValue'
import AnimatedArray from './AnimatedArray'
import AnimatedProps from './AnimatedProps'
import * as Globals from './Globals'
import {
  withDefault,
  toArray,
  getValues,
  callProp,
  shallowEqual,
} from '../shared/helpers'

export default class AnimationController {
  active = false
  props = {}
  hasChanged = false
  merged = {}
  animations = {}
  interpolations = {}
  configs = []
  frame = undefined
  animatedProps = undefined
  startTime = undefined
  lastTime = undefined

  update(props) {
    this.props = props
    let {
      from = {},
      to = {},
      reverse,
      attach,
      reset,
      immediate,
      config,
      delay,
      native,
      onFrame,
    } = props

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
        const entry = (!reset && acc[name]) || {}

        /**
         * Allowed input
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

        // Attach allows a spring to fetch its values elsewhere
        if (target && target.animations[name])
          value = attachedAnimation.animation

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
        const changes = isAnimated ? value.getAnimatedValue() : value

        // Detect changes, animated values will be checked in the raf-loop
        if (isAnimated || !shallowEqual(entry.changes, changes)) {
          this.hasChanged = true

          let parent, interpolation
          from = from[name] !== void 0 ? from[name] : value
          config = callProp(config, name)

          /*if (isAnimated) {
            isTrailing = true
            // Use provided animated value
            animation = interpolation =
              entry.animation || new value.constructor(_from.getValue())
            // If we're animating towards another AnimatedValue, see if it's done
            //if (_to && toArray(_to._values).some(value => !value._done))
            hasChanged = true
            // Replace toValue with the numeric content
            _to = _to.getValue()
          } else */

          if (isAnimated) {
            debugger
          } else if (isNumber || isString) {
            parent = interpolation = entry.parent || new AnimatedValue(from)
          } else if (isArray) {
            parent = interpolation = entry.parent || new AnimatedArray(from)
          } else if (isInterpolation) {
            // Deal with interpolations
            const prev =
              entry.interpolation &&
              entry.interpolation.interpolate(entry.parent.value)
            // Interpolations are not addaptive, start with 0
            if (entry.parent) {
              parent = entry.parent
              parent.setValue(0)
            } else parent = new AnimatedValue(0)
            // Map from-to on a scale between 0-1
            const range = { output: [prev !== void 0 ? prev : from, value] }
            if (entry.interpolation)
              interpolation = entry.interpolation.updateConfig(range)
            else interpolation = parent.interpolate(range)
            // And stop at 1
            value = 1
          } else return entry

          // Map output values to an array so reading out is easier later on
          const animatedValues = toArray(parent.getAnimatedValue())
          const fromValues = toArray(parent.getValue())
          const toValues = toArray(isAnimated ? value.getValue() : value)

          // Set immediate values
          if (callProp(immediate, name)) parent.setValue(value)
          // Reset animated values
          animatedValues.forEach(value => value.reset(this.active))

          return {
            ...acc,
            [name]: {
              ...entry,
              parent, // The animated object on which the update-cb is called
              interpolation, // The parents interpolation, if any. If not it refers to the parent
              animatedValues, // An array of all animated values taking part in this op
              fromValues, // Raw/numerical start-state values
              toValues, // Raw/numerical/end-state values
              changes,
              delay,
              initialVelocity: withDefault(config.velocity, 0),
              clamp: withDefault(config.clamp, false),
              precision: withDefault(config.precision, 0.01),
              tension: withDefault(config.tension, 170),
              friction: withDefault(config.friction, 26),
              mass: withDefault(config.mass, 1),
              duration: withDefault(config.duration, 0),
              easing: withDefault(config.easing, t => t),
            },
          }
        } else return entry
      },
      this.animations
    )

    if (this.hasChanged) {
      this.configs = getValues(this.animations)
      this.interpolations = Object.entries(this.animations).reduce(
        (acc, [name, { interpolation }]) => ({ ...acc, [name]: interpolation }),
        {}
      )
      const oldAnimatedProps = this.animatedProps
      this.animatedProps = new AnimatedProps(this.interpolations, () => {
        // This gets called on every animation frame ...
        if (onFrame) onFrame(this.animatedProps.getValue())
        if (!native && this.onUpdate) this.onUpdate()
      })
      oldAnimatedProps && oldAnimatedProps.detach()
    }
  }

  start(onEnd, onUpdate) {
    this.startTime = Globals.now()
    if (this.active) this.stop()

    this.active = true
    this.onEnd = onEnd
    this.onUpdate = onUpdate

    if (this.props.onStart) this.props.onStart()
    // Start RAF loop
    this.frame = Globals.requestFrame(this.raf)
  }

  stop(finished = false) {
    this.active = false
    Globals.cancelFrame(this.frame)
    this.debouncedOnEnd({ finished })
  }

  debouncedOnEnd(result) {
    this.active = false
    const onEnd = this.onEnd
    this.onEnd = null
    onEnd && onEnd(result)
  }

  getRawValues = () => (this.animatedProps ? this.animatedProps.getValue() : {})

  getValues = () =>
    this.props.native ? this.interpolations : this.getRawValues()

  raf = () => {
    let now = Globals.now()
    let isDone = true
    let noChange = true

    for (let a = 0; a < this.configs.length; a++) {
      const config = this.configs[a]
      const {
        parent, // The animated object on which the update-cb is called
        interpolation, // The parents interpolation, if any. If not it refers to the parent
        animatedValues, // An array of all animated values taking part in this op
        fromValues, // Raw/numerical start-state values
        toValues, // Raw/numerical/end-state values

        delay,
        tension,
        friction,
        precision,
        mass,
        clamp,
        duration,
        easing,
        initialVelocity,
      } = config

      // Doing delay here instead of setTimeout is one async worry less
      if (delay && now - this.startTime < delay) {
        isDone = false
        continue
      }

      for (let b = 0; b < config.animatedValues.length; b++) {
        let animation = config.animatedValues[b]
        let position = animation.lastPosition
        let from = config.fromValues[b]
        let to = config.toValues[b]

        // If an animation is done, skip, until all of them conclude
        if (animation.done) continue

        // Break animation when string values are involved
        if (typeof from === 'string' || typeof to === 'string') {
          animation.updateValue(to)
          animation.done = true
          continue
        } else noChange = false

        let endOfAnimation
        if (duration) {
          position =
            from +
            easing((now - this.startTime - delay) / duration) * (to - from)
          endOfAnimation = now >= this.startTime + delay + duration
        } else {
          let lastTime =
            animation.lastTime !== void 0 ? animation.lastTime : now
          let velocity =
            animation.lastVelocity !== void 0
              ? animation.lastVelocity
              : initialVelocity

          // If we lost a lot of frames just jump to the end.
          if (now > lastTime + 64) now = lastTime + 64
          // http://gafferongames.com/game-physics/fix-your-timestep/
          const numSteps = Math.floor(now - lastTime)
          for (let i = 0; i < numSteps; ++i) {
            const force = -tension * (position - to)
            const damping = -friction * velocity
            const acceleration = (force + damping) / mass
            velocity = velocity + (acceleration * 1) / 1000
            position = position + (velocity * 1) / 1000
          }

          // Conditions for stopping the spring animation
          const isOvershooting =
            clamp && tension !== 0
              ? from < to
                ? position > to
                : position < to
              : false
          const isVelocity = Math.abs(velocity) <= precision
          const isDisplacement =
            tension !== 0 ? Math.abs(to - position) <= precision : true
          endOfAnimation = isOvershooting || (isVelocity && isDisplacement)

          animation.lastVelocity = velocity
          animation.lastTime = now
        }

        // Trails aren't done until their parents conclude
        //if (isTrailing /*&& !anim.to._done*/) endOfAnimation = false

        if (endOfAnimation) {
          // Ensure that we end up with a round value
          if (animation.value !== to) position = to
          animation.done = true
        } else isDone = false

        //debugger
        animation.updateValue(position)
        animation.lastPosition = position
      }
    }

    if (isDone) return this.debouncedOnEnd({ finished: true, noChange })
    this.frame = Globals.requestFrame(this.raf)
  }
}
