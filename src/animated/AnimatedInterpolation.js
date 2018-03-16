import Animated from './Animated'
import AnimatedWithChildren from './AnimatedWithChildren'
import Interpolation from './Interpolation'
import guid from './guid'

class AnimatedInterpolation extends AnimatedWithChildren {
    constructor(parent, interpolation) {
        super()
        this._parent = parent
        this._interpolation = interpolation
        this._listeners = {}
    }

    __getValue() {
        const parentValue = this._parent.__getValue()
        return this._interpolation(parentValue)
    }

    addListener(callback) {
        if (!this._parentListener) {
            this._parentListener = this._parent.addListener(() => {
                for (const key in this._listeners) {
                    this._listeners[key]({
                        value: this.__getValue(),
                    })
                }
            })
        }

        const id = guid()
        this._listeners[id] = callback
        return id
    }

    removeListener(id) {
        delete this._listeners[id]
    }

    interpolate(config) {
        return new AnimatedInterpolation(this, Interpolation.create(config))
    }

    __attach() {
        this._parent.__addChild(this)
    }

    __detach() {
        this._parent.__removeChild(this)

        this._parentListener = this._parent.removeListener(this._parentListener)
    }
}

export default AnimatedInterpolation
