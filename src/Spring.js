import React from 'react'
import PropTypes from 'prop-types'
import Animated from './animated/targets/react-dom'

const animated = Animated.elements
const template = Animated.template
const interpolate = Animated.interpolate
const config = {
    default: { tension: 170, friction: 26 },
    gentle: { tension: 120, friction: 14 },
    wobbly: { tension: 180, friction: 12 },
    stiff: { tension: 210, friction: 20 },
    slow: { tension: 280, friction: 60 },
}

export { config, template, animated, interpolate }

export default class Spring extends React.PureComponent {
    static propTypes = {
        to: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
        from: PropTypes.object,
        config: PropTypes.object,
        native: PropTypes.bool,
        onRest: PropTypes.func,
        onFrame: PropTypes.func,
        children: PropTypes.oneOfType([PropTypes.func, PropTypes.arrayOf(PropTypes.func)]),
        render: PropTypes.func,
        reset: PropTypes.bool,
        immediate: PropTypes.oneOfType([PropTypes.bool, PropTypes.arrayOf(PropTypes.string)]),
    }
    static defaultProps = { from: {}, to: {}, config: config.default, native: false, immediate: false, reset: false }

    constructor(props) {
        super()
        this.defaultAnimation = new Animated.Value(0)
        this.animations = {}
        this.update(props, false)
    }

    update({ from, to, config, attach, immediate, reset, onFrame, onRest }, start = false) {
        const allProps = Object.entries({ ...from, ...to })
        const defaultAnimationValue = this.defaultAnimation._value

        this.interpolators = {}
        this.defaultAnimation.setValue(0)
        this.animations = allProps.reduce((acc, [name, value], i) => {
            const entry = (reset === false && this.animations[name]) || (this.animations[name] = {})
            let isNumber = typeof value === 'number'
            let isArray = !isNumber && Array.isArray(value)
            let fromValue = from[name] !== undefined ? from[name] : value
            let toValue = isNumber || isArray ? value : 1

            if (isNumber && attach) {
                // Attach value to target animation
                const target = attach(this)
                const targetAnimation = target && target.animations[name]
                if (targetAnimation) toValue = targetAnimation.animation
            }

            if (isNumber) {
                // Create animated value
                entry.animation = entry.interpolation = entry.animation || new Animated.Value(fromValue)
            } else if (isArray) {
                // Create animated array
                entry.animation = entry.interpolation = entry.animation || new Animated.Array(fromValue)
            } else {
                // Deal with interpolations
                const previous = entry.interpolation && entry.interpolation._interpolation(defaultAnimationValue)
                entry.animation = this.defaultAnimation
                entry.interpolation = this.defaultAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [previous !== undefined ? previous : fromValue, value],
                })
            }

            if (immediate && (immediate === true || immediate.indexOf(name) !== -1)) entry.animation.setValue(toValue)

            entry.stopped = false
            entry.start = () => {
                Animated.spring(entry.animation, { toValue, ...config }).start(props => {
                    if (props.finished) {
                        this.animations[name].stopped = true
                        if (Object.values(this.animations).every(animation => animation.stopped))
                            onRest && onRest({ ...this.props.from, ...this.props.to })
                    }
                })
            }
            entry.stop = () => entry.animation.stopAnimation()

            this.interpolators[name] = entry.interpolation
            return { ...acc, [name]: entry }
        }, {})

        var oldPropsAnimated = this.propsAnimated
        this.propsAnimated = new Animated.AnimatedProps(this.interpolators, this.callback)
        oldPropsAnimated && oldPropsAnimated.__detach()

        if (start) Object.values(this.animations).forEach(animation => animation.start())
    }

    callback = v => {
        if (this.props.onFrame) this.props.onFrame(this.propsAnimated.__getValue())
        !this.props.native && this.forceUpdate()
    }

    componentWillReceiveProps(props) {
        this.update(props, true)
    }

    componentDidMount() {
        Object.values(this.animations).forEach(animation => animation.start())
    }

    componentWillUnmount() {
        Object.values(this.animations).forEach(animation => animation.stop())
    }

    getValues() {
        return this.propsAnimated.__getValue()
    }

    render() {
        const { children, render, from, to, config, native, ...extra } = this.props
        let animatedProps = { ...(native ? this.interpolators : this.propsAnimated.__getValue()), ...extra }
        if (render) return render({ ...animatedProps, children })
        else return Array.isArray(children) ? children.map(child => child(animatedProps)) : children(animatedProps)
    }
}
