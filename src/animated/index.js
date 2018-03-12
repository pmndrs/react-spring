import invariant from 'invariant'
import Animated from './Animated'
import AnimatedValue from './AnimatedValue'
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

var spring = function(value, config) {
    return {
        start: function(callback) {
            var singleValue = value
            var singleConfig = config
            //singleValue.stopTracking()

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
}

const exports = {
    Value: AnimatedValue,
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
