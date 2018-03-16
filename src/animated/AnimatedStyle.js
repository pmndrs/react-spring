import Animated from './Animated'
import AnimatedWithChildren from './AnimatedWithChildren'
import FlattenStyle from './injectable/FlattenStyle'

class AnimatedStyle extends AnimatedWithChildren {
    constructor(style) {
        super()
        style = FlattenStyle.current(style) || {}
        this._style = style
    }

    __getValue() {
        const style = {}
        for (const key in this._style) {
            const value = this._style[key]
            if (value instanceof Animated) style[key] = value.__getValue()
            else style[key] = value
        }

        return style
    }

    __getAnimatedValue() {
        const style = {}
        for (const key in this._style) {
            const value = this._style[key]
            if (value instanceof Animated) style[key] = value.__getAnimatedValue()
        }
        return style
    }

    __attach() {
        for (const key in this._style) {
            const value = this._style[key]
            if (value instanceof Animated) value.__addChild(this)
        }
    }

    __detach() {
        for (const key in this._style) {
            const value = this._style[key]
            if (value instanceof Animated) value.__removeChild(this)
        }
    }
}

export default AnimatedStyle
