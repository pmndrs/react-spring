import Animated from './Animated'
import AnimatedArray from './AnimatedArray'
import * as Globals from './Globals'
import springImpl from '../impl/see'
import { withDefault, toArray } from '../shared/helpers'

export default class AnimationController {
  constructor(impl = springImpl) {
    this.impl = impl
  }

  set(configs) {
    // Stop all ongoing animations
    this.stop()
    // Enforce arrays
    config = toArray(config)
    // Build configuration
    this.configs = configs.map(config => {
      let to = config.to
      let value = config.value
      let vConfig = this.impl.setValueConfig(config)
      let animations =
        value instanceof AnimatedArray
          ? value._values.map((value, i) => ({ value, to: to[i], ...vConfig }))
          : [{ value, to, ...vConfig }]
      return {
        ...this.impl.setGlobalConfig(config),
        delay: withDefault(config.delay, 0),
        animations,
      }
    })
    return this
  }

  start(onEnd) {
    this.__active = true
    this.__onEnd = onEnd
    const now = Globals.now()
    this.startTime = now
    this.lastTime = now

    // Prepare configs and values
    this.configs = this.configs.map(config => ({
      ...config,
      animations: config.animations.map(({ value, to, ...rest }) => {
        let val = value._value
        value._done = false
        value._animatedStyles.clear()
        return { value, to, startPos: val, lastPos: val, ...rest }
      }),
    }))

    // Start RAF loop
    this._animationFrame = Globals.requestFrame(this.update)
    return this
  }

  update = () => {
    let now = Globals.now()
    let isDone = true
    let noChange = true

    // Run through all the configs, each representing a to-prop
    for (let iConfig = 0; iConfig < this.configs.length; iConfig++) {
      let config = this.configs[iConfig]

      // Doing delay here instead of setTimeout is one async worry less
      if (config.delay && now - this.startTime < config.delay) {
        isDone = false
        continue
      }

      // A prop could be an AnimatedValue or an AnimatedArray
      for (let iAnim = 0; iAnim < config.animations.length; iAnim++) {
        const anim = config.animations[iAnim]
        const from = anim.startPos
        const to = anim.to

        // If an animation is done, skip, until all of them conclude
        if (anim.value._done) continue

        // Break animation when string values are involved or start/end value match
        if (from === to || typeof from === 'string' || typeof to === 'string') {
          anim.value._updateValue(to)
          anim.value._done = true
          continue
        } else noChange = false

        let isTrailing = anim.to instanceof Animated
        let interpTo = isTrailing ? anim.to.__getValue() : anim.to
        let [pos, endOfAnimation] = this.impl.update(
          config,
          anim,
          anim.startPos,
          interpTo,
          anim.lastPos,
          now,
          this.startTime,
          this.lastTime
        )

        anim.lastPos = pos

        // Trails aren't done until their parents conclude
        if (isTrailing && !anim.to._done) endOfAnimation = false

        // a listener might have stopped us in _onUpdate
        if (!this.__active) return

        if (endOfAnimation) {
          // Ensure that we end up with a round value
          if (anim.value._value !== interpTo) anim.value._updateValue(interpTo)
          anim.value._done = true
        } else {
          anim.value._updateValue(anim.lastPos)
          isDone = false
        }
      }
    }

    if (isDone) return this.__debouncedOnEnd({ finished: true, noChange })

    this.lastTime = now
    this._animationFrame = Globals.requestFrame(this.update)
  }

  stop() {
    if (!this.configs) return
    Globals.cancelFrame(this._animationFrame)
    this.__active = false
    this.__debouncedOnEnd({ finished: false })
    return this
  }

  __debouncedOnEnd(result) {
    const onEnd = this.__onEnd
    this.__onEnd = null
    this.__active = false
    onEnd && onEnd(result)
  }
}
