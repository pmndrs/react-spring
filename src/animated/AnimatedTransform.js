import Animated from './Animated'
import AnimatedWithChildren from './AnimatedWithChildren'

class AnimatedTransform extends AnimatedWithChildren {
    constructor(transforms) {
        super()
        this._transforms = transforms
    }

    __getValue() {
        return this._transforms.map(transform => {
            const result = {}

            for (const key in transform) {
                const value = transform[key]

                if (value instanceof Animated) {
                    result[key] = value.__getValue()
                } else {
                    result[key] = value
                }
            }

            return result
        })
    }

    __getAnimatedValue() {
        return this._transforms.map(transform => {
            const result = {}

            for (const key in transform) {
                const value = transform[key]

                if (value instanceof Animated) {
                    result[key] = value.__getAnimatedValue()
                } else {
                    // All transform components needed to recompose matrix
                    result[key] = value
                }
            }

            return result
        })
    }

    __attach() {
        this._transforms.forEach(transform => {
            for (const key in transform) {
                const value = transform[key]

                if (value instanceof Animated) {
                    value.__addChild(this)
                }
            }
        })
    }

    __detach() {
        this._transforms.forEach(transform => {
            for (const key in transform) {
                const value = transform[key]

                if (value instanceof Animated) {
                    value.__removeChild(this)
                }
            }
        })
    }
}

export default AnimatedTransform
