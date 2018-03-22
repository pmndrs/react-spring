import React from 'react'
import PropTypes from 'prop-types'
import Animated from './animated/targets/react-dom'

const Value = Animated.Value
const Array = Animated.Array
const template = Animated.template
const animated = Animated.elements
const config = {
    default: { tension: 170, friction: 26 },
    gentle: { tension: 120, friction: 14 },
    wobbly: { tension: 180, friction: 12 },
    stiff: { tension: 210, friction: 20 },
    slow: { tension: 280, friction: 60 },
}

export { config, template, animated, Value, Array }

export default class Spring extends React.PureComponent {
    static propTypes = {
        to: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
        from: PropTypes.object,
        config: PropTypes.object,
        native: PropTypes.bool,
        onRest: PropTypes.func,
        children: PropTypes.func,
        render: PropTypes.func,
        immediate: PropTypes.oneOfType([PropTypes.bool, PropTypes.arrayOf(PropTypes.string)]),
    }
    static defaultProps = { from: {}, to: {}, config: config.default, native: false, immediate: false }

    constructor(props) {
        super()
        this.defaultAnimation = new Animated.Value(0)
        this.animations = {}
        this.update(props, false)
    }

    update({ from, to, config, attach, immediate }, start = false) {
        const allProps = Object.entries({ ...from, ...to })
        const defaultAnimationValue = this.defaultAnimation._value

        this.interpolators = {}
        this.defaultAnimation.setValue(0)
        this.animations = allProps.reduce((acc, [name, value], i) => {
            const entry = this.animations[name] || (this.animations[name] = {})

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
            entry.start = () => Animated.spring(entry.animation, { toValue, ...config }).start(i === 0 && this.onRest)
            entry.stop = () => entry.animation.stopAnimation()
            start && entry.start()

            this.interpolators[name] = entry.interpolation
            return { ...acc, [name]: entry }
        }, {})

        var oldPropsAnimated = this.propsAnimated
        this.propsAnimated = new Animated.AnimatedProps(this.interpolators, this.callback)
        oldPropsAnimated && oldPropsAnimated.__detach()
    }

    callback = () => !this.props.native && this.forceUpdate()
    onRest = props => props.finished && this.props.onRest && this.props.onRest()

    componentWillReceiveProps(props) {
        this.update(props, true)
    }

    componentDidMount() {
        Object.values(this.animations).forEach(({ start }) => start())
    }

    componentWillUnmount() {
        Object.values(this.animations).forEach(({ stop }) => stop())
    }

    render() {
        const { children, render, from, to, config, native, ...extra } = this.props
        let animatedProps = native ? this.interpolators : this.propsAnimated.__getValue()
        return render ? render({ ...animatedProps, ...extra, children }) : children({ ...animatedProps, ...extra })
    }
}
