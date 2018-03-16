import Animated from './Animated'
import AnimatedValue from './AnimatedValue'
import AnimatedArray from './AnimatedArray'
import Animation from './Animation'
import AnimatedTemplate from './AnimatedTemplate'
import AnimatedTracking from './AnimatedTracking'
import SpringAnimation from './SpringAnimation'
import createAnimatedComponent from './createAnimatedComponent'
import ApplyAnimatedValues from './injectable/ApplyAnimatedValues'
import InteractionManager from './injectable/InteractionManager'
import FlattenStyle from './injectable/FlattenStyle'
import RequestAnimationFrame from './injectable/RequestAnimationFrame'
import CancelAnimationFrame from './injectable/CancelAnimationFrame'
import AnimatedProps from './AnimatedProps'

const maybeVectorAnim = (array, { tension, friction, toValue }, anim) => {
    // { tension, friction, toValue: [...]}
    if (array instanceof AnimatedArray)
        return parallel(array.values.map((v, i) => anim(v, { tension, friction, toValue: toValue[i] })), {
            stopTogether: false,
        })
    return null
}

var spring = function(value, config) {
    return (
        maybeVectorAnim(value, config, spring) || {
            start: function(callback) {
                var singleValue = value
                var singleConfig = config
                singleValue.stopTracking()
                if (config.toValue instanceof Animated) {
                    singleValue.track(
                        new AnimatedTracking(singleValue, config.toValue, SpringAnimation, singleConfig, callback),
                    )
                } else {
                    singleValue.animate(new SpringAnimation(singleConfig), callback)
                }
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
            if (doneCount === animations.length) {
                callback && callback({ finished: true })
                return
            }
            animations.forEach((animation, idx) => {
                const cb = endResult => {
                    hasEnded[idx] = true
                    doneCount++
                    if (doneCount === animations.length) {
                        doneCount = 0
                        callback && callback(endResult)
                        return
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
    createAnimatedComponent,
    inject: {
        ApplyAnimatedValues: ApplyAnimatedValues.inject,
        InteractionManager: InteractionManager.inject,
        FlattenStyle: FlattenStyle.inject,
        RequestAnimationFrame: RequestAnimationFrame.inject,
        CancelAnimationFrame: CancelAnimationFrame.inject,
    },
    ApplyAnimatedValues,
    AnimatedProps,
}

export default exports
