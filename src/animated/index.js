import Animated from './Animated'
import AnimatedValue from './AnimatedValue'
import AnimatedArray from './AnimatedArray'
import Animation from './Animation'
import AnimatedTemplate from './AnimatedTemplate'
import AnimatedInterpolation from './AnimatedInterpolation'
import AnimatedTracking from './AnimatedTracking'
import SpringAnimation from './SpringAnimation'
import createAnimatedComponent from './createAnimatedComponent'
import ApplyAnimatedValues from './injectable/ApplyAnimatedValues'
import AnimatedProps from './AnimatedProps'

const maybeVectorAnim = (array, { tension, friction, toValue }, anim, impl) => {
  // { tension, friction, toValue: [...]}
  if (array instanceof AnimatedArray)
    return parallel(
      array._values.map((v, i) =>
        anim(v, { tension, friction, toValue: toValue[i] }, impl)
      ),
      {
        stopTogether: false,
      }
    )
  return null
}

var controller = function(value, config, impl) {
  return (
    maybeVectorAnim(value, config, controller, impl) || {
      start: function(callback) {
        var singleValue = value
        var singleConfig = config
        singleValue.stopTracking()
        if (config.toValue instanceof Animated)
          singleValue.track(
            new AnimatedTracking(
              singleValue,
              config.toValue,
              impl,
              singleConfig,
              callback
            )
          )
        else singleValue.animate(new impl(singleConfig), callback)
      },
      stop: function() {
        value.stopAnimation()
      },
    }
  )
}

var parallel = (animations, config) => {
  let doneCount = 0
  const hasEnded = {}
  const stopTogether = !(config && config.stopTogether === false)
  const result = {
    start(callback) {
      if (doneCount === animations.length)
        return callback && callback({ finished: true })
      animations.forEach((animation, idx) => {
        const cb = endResult => {
          hasEnded[idx] = true
          doneCount++
          if (doneCount === animations.length) {
            doneCount = 0
            return callback && callback(endResult)
          }
          if (!endResult.finished && stopTogether) result.stop()
        }
        if (!animation) cb({ finished: true })
        else animation.start(cb)
      })
    },
    stop() {
      animations.forEach((animation, idx) => {
        !hasEnded[idx] && animation.stop()
        hasEnded[idx] = true
      })
    },
  }
  return result
}

export const template = (strings, ...values) =>
  new AnimatedTemplate(strings, values)

export const interpolate = (parents, config) =>
  new AnimatedInterpolation(parents, config)

export const inject = {
  ApplyAnimatedValues: ApplyAnimatedValues.inject,
}

export {
  AnimatedValue,
  AnimatedArray,
  controller,
  createAnimatedComponent,
  ApplyAnimatedValues,
  AnimatedProps,
}
