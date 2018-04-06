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
import FlattenStyle from './injectable/FlattenStyle'
import RequestAnimationFrame from './injectable/RequestAnimationFrame'
import CancelAnimationFrame from './injectable/CancelAnimationFrame'
import AnimatedProps from './AnimatedProps'

const maybeVectorAnim = (array, { tension, friction, toValue }, anim) => {
    // { tension, friction, toValue: [...]}
    if (array instanceof AnimatedArray)
        return parallel(array._values.map((v, i) => anim(v, { tension, friction, toValue: toValue[i] })), { stopTogether: false })
    return null
}

var spring = function(value, config) {
    return (
        maybeVectorAnim(value, config, spring) || {
            start: function(callback) {
                var singleValue = value
                var singleConfig = config
                singleValue.stopTracking()
                if (config.toValue instanceof Animated)
                    singleValue.track(new AnimatedTracking(singleValue, config.toValue, SpringAnimation, singleConfig, callback))
                else singleValue.animate(new SpringAnimation(singleConfig), callback)
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
            if (doneCount === animations.length) return callback && callback({ finished: true })
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

const exports = {
    Value: AnimatedValue,
    Array: AnimatedArray,
    spring,
    template: function template(strings, ...values) {
        return new AnimatedTemplate(strings, values)
    },
    interpolate: function(parents, config) {
        return new AnimatedInterpolation(values, config)
    },
    createAnimatedComponent,
    inject: {
        ApplyAnimatedValues: ApplyAnimatedValues.inject,
        FlattenStyle: FlattenStyle.inject,
        RequestAnimationFrame: RequestAnimationFrame.inject,
        CancelAnimationFrame: CancelAnimationFrame.inject,
    },
    ApplyAnimatedValues,
    AnimatedProps,
}

export default exports