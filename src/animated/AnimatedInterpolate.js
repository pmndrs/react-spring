import Animated from './Animated'
import AnimatedWithChildren from './AnimatedWithChildren'

export default class extends AnimatedWithChildren {
    constructor(values, callback) {
        super()
        this._values = Array.isArray(values) ? values : [values]
        this._callback = callback
    }

    __getValue() {
        return this._callback(...this._values.map(value => value.__getValue()))
    }

    __attach() {
        for (let i = 0; i < this._values.length; ++i)
            if (this._values[i] instanceof Animated) this._values[i].__addChild(this)
    }

    __detach() {
        for (let i = 0; i < this._values.length; ++i)
            if (this._values[i] instanceof Animated) this._values[i].__removeChild(this)
    }
}
