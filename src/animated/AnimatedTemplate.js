import Animated from './Animated'
import AnimatedWithChildren from './AnimatedWithChildren'

class AnimatedTemplate extends AnimatedWithChildren {
    constructor(strings, values) {
        super()
        this._strings = strings
        this._values = values
    }

    __transformValue(value) {
        if (value instanceof Animated) return value.__getValue()
        else return value
    }

    __getValue() {
        let value = this._strings[0]
        for (let i = 0; i < this._values.length; ++i) {
            value += this.__transformValue(this._values[i]) + this._strings[1 + i]
        }
        return value
    }

    __attach() {
        for (let i = 0; i < this._values.length; ++i) {
            if (this._values[i] instanceof Animated) this._values[i].__addChild(this)
        }
    }

    __detach() {
        for (let i = 0; i < this._values.length; ++i) {
            if (this._values[i] instanceof Animated) this._values[i].__removeChild(this)
        }
    }
}

export default AnimatedTemplate
