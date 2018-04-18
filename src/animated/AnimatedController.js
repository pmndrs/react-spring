import Animated from './Animated'
import AnimatedArray from './AnimatedArray'
import AnimatedTracking from './AnimatedTracking'

function maybeVectorAnim(array, { tension, friction, toValue }, anim, impl) {
  // { tension, friction, toValue: [...]}
  if (array instanceof AnimatedArray)
    return parallel(
      array._values.map((v, i) =>
        anim(v, { tension, friction, toValue: toValue[i] }, impl)
      ),
      { stopTogether: false }
    )
  return null
}

function parallel(animations, config) {
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

export default function controller(value, config, impl) {
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
