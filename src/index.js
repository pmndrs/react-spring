import React from 'react'
import PropTypes from 'prop-types'
import Animated from 'animated/lib/targets/react-dom'

function createAnimatedValue(name, from, to) {
    const animation = new Animated.Value(0)
    const result = {
        name,
        animation,
        interpolate: animation.interpolate({ inputRange: [0, 1], outputRange: [from, to] }),
    }
    return result
}

export default class Spring extends React.PureComponent {
    static propTypes = { to: PropTypes.object, from: PropTypes.object, interpolator: PropTypes.func }
    static defaultProps = { to: {}, from: {}, interpolator: Animated.spring }

    constructor(props) {
        super()
        const { children, to, from } = props
        this.component = Animated.createAnimatedComponent(children)
        this.animations = Object.entries(to).map(([key, value]) =>
            createAnimatedValue(key, from[key] !== undefined ? from[key] : value, value),
        )
        this.to = this.animations.reduce((acc, anim) => ({ ...acc, [anim.name]: anim.interpolate }), {})
    }

    update = props => {
        const { to, from, interpolator } = props
        for (let anim of this.animations) {
            const currentValue = anim.animation._value
            anim.animation.stopAnimation()
            if (to[anim.name] !== anim.to) {
                anim.animation = new Animated.Value(0)
                anim.interpolate = anim.animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [anim.interpolate._interpolation(currentValue), to[anim.name]],
                })
                interpolator(anim.animation, { toValue: 1 }).start()
            }
        }
        this.to = this.animations.reduce((acc, anim) => ({ ...acc, [anim.name]: anim.interpolate }), {})
    }

    componentWillReceiveProps(props) {
        this.update(props)
    }

    componentWillMount() {
        this.animations.forEach(anim => this.props.interpolator(anim.animation, { toValue: 1 }).start())
    }

    render() {
        return React.createElement(this.component, this.to)
    }
}