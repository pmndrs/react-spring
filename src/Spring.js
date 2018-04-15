import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import Animated from './animated/targets/react-dom'
import SpringAnimation from './animated/SpringAnimation'

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
        impl: PropTypes.func,
    }
    static defaultProps = {
        from: {},
        to: {},
        config: config.default,
        native: false,
        immediate: false,
        reset: false,
        impl: SpringAnimation,
    }

    state = { props: undefined }
    defaultAnimation = new Animated.Value(0)
    animations = {}

    componentWillUnmount() {
        this.stop()
    }

    componentWillMount() {
        this.updateProps(this.props)
    }

    componentWillReceiveProps(props) {
        this.updateProps(props)
    }

    async updateProps({ inject, ...props }) {
        const { impl, from, to, config, attach, immediate, reset, onFrame, onRest } = inject ? await inject(this, props) : props

        const allProps = Object.entries({ ...from, ...to })
        const defaultAnimationValue = this.defaultAnimation._value

        this.defaultAnimation.setValue(0)
        this.interpolators = {}
        this.animations = allProps.reduce((acc, [name, value], i) => {
            const entry = (reset === false && this.animations[name]) || (this.animations[name] = {})

            let isNumber = typeof value === 'number'
            let isArray = !isNumber && Array.isArray(value)
            let fromValue = from[name] !== undefined ? from[name] : value
            let toValue = isNumber || isArray ? value : 1

            if (isNumber && attach) {
                // Attach value to target animation
                const target = attach(this)
                const targetAnimation = target && target.animations[name]
                if (targetAnimation) toValue = targetAnimation.animation
            }

            if (isNumber || toValue === 'auto') {
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
                    range: [0, 1],
                    output: [previous !== undefined ? previous : fromValue, value],
                })
            }

            if (immediate && (immediate === true || immediate.indexOf(name) !== -1)) entry.animation.setValue(toValue)

            entry.stopped = false
            entry.start = cb => {
                Animated.controller(entry.animation, { toValue, ...config }, impl).start(props => {
                    if (props.finished) {
                        this.animations[name].stopped = true
                        if (Object.values(this.animations).every(animation => animation.stopped)) {
                            const current = { ...this.props.from, ...this.props.to }
                            onRest && onRest(current)
                            cb && cb(current)
                        }
                    }
                })
            }
            entry.stop = () => {
                entry.stopped = true
                entry.animation.stopAnimation()
            }

            this.interpolators[name] = entry.interpolation
            return { ...acc, [name]: entry }
        }, {})

        const oldAnimatedProps = this.animatedProps
        this.animatedProps = new Animated.AnimatedProps(this.interpolators, this.callback)
        oldAnimatedProps && oldAnimatedProps.__detach()

        this.forceUpdate()
        this.start()
    }

    start() {
        return new Promise(res => this.getAnimations().forEach(animation => animation.start(res)))
    }

    stop() {
        this.getAnimations().forEach(animation => animation.stop())
    }

    callback = () => {
        if (this.props.onFrame) this.props.onFrame(this.animatedProps.__getValue())
        !this.props.native && this.forceUpdate()
    }

    getAnimations() {
        return Object.values(this.animations)
    }

    getValues() {
        return this.animatedProps ? this.animatedProps.__getValue() : {}
    }

    getAnimatedValues() {
        return this.props.native ? this.interpolators : this.getValues()
    }

    render() {
        const { children, render, from, to, config, native, inject, ...extra } = this.props
        const values = this.getAnimatedValues()
        if (Object.keys(values).length) {
            const animatedProps = { ...this.getAnimatedValues(), ...extra }
            return render ? render({ ...animatedProps, children }) : children(animatedProps)
        } else return null
    }
}
