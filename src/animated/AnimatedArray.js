import Animated from './Animated'
import AnimatedValue from './AnimatedValue'
import AnimatedWithChildren from './AnimatedWithChildren'
import guid from './guid'

class AnimatedArray extends AnimatedWithChildren {
    constructor(array) {
        super()
        this.values = array.map(n => new AnimatedValue(n))
        this._listeners = {}
    }

    setValue(values) {
        values.forEach((n, i) => this.values[i].setValue(n))
    }

    setOffset(values) {
        values.forEach((n, i) => this.values[i].setOffset(n))
    }

    flattenOffset() {
        this.values.forEach(v => v.flattenOffset())
    }

    __getValue() {
        return this.values.map(v => v.__getValue())
    }

    stopAnimation(callback) {
        this.values.forEach(v => v.stopAnimation())
        callback && callback(this.__getValue())
    }

    addListener(callback) {
        const id = guid()
        const jointCallback = ({ value: number }) => callback(this.__getValue())
        this._listeners[id] = this.values.map(v => v.addListener(jointCallback))
        return id
    }

    removeListener(id) {
        this.values.forEach(v => v.removeListener(id))
        delete this._listeners[id]
    }

    __attach() {
        for (let i = 0; i < this.values.length; ++i) {
            if (this.values[i] instanceof Animated) {
                this.values[i].__addChild(this)
            }
        }
    }

    __detach() {
        for (let i = 0; i < this.values.length; ++i) {
            if (this.values[i] instanceof Animated) {
                this.values[i].__removeChild(this)
            }
        }
    }
}

export default AnimatedArray
