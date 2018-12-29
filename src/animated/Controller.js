import Animated from './Animated'
import AnimatedValue from './AnimatedValue'
import AnimatedArray from './AnimatedArray'
import { now, colorNames } from './Globals'
import { addController, removeController } from './FrameLoop'
import {
  interpolateTo,
  withDefault,
  toArray,
  getValues,
  callProp,
  shallowEqual,
} from '../shared/helpers'

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
              parent.setValue(0, false)
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
          if (callProp(immediate, name)) parent.setValue(value, false)

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
              animatedValues,
              changes: value,
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
    addController(this)
    return new Promise(res => (this.resolve = res))
  }

  stop(finished = false) {
    // Reset collected changes since the animation has been stopped cold turkey
    if (finished)
      getValues(this.animations).forEach(a => (a.changes = undefined))
    this.debouncedOnEnd({ finished })
  }

  destroy() {
    removeController(this)
    this.props = {}
    this.merged = {}
    this.animations = {}
    this.interpolations = {}
    this.animatedProps = {}
    this.configs = []
  }

  debouncedOnEnd(result) {
    removeController(this)
    this.isActive = false
    const onEnd = this.onEnd
    this.onEnd = null
    if (onEnd) onEnd(result)
    if (this.resolve) this.resolve()
    this.resolve = null
  }

  getValues = () =>
    this.props.native ? this.interpolations : this.animatedProps
}
