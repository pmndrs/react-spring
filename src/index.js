import React from 'react'
import PropTypes from 'prop-types'
import Animated from './animated'

export default class Spring extends React.PureComponent {
    static propTypes = { to: PropTypes.object, from: PropTypes.object, interpolator: PropTypes.func }
    static defaultProps = { to: {}, from: {}, interpolator: Animated.spring }

    constructor(props) {
        super()
        const { children, to, from } = props
        this.animation = new Animated.Value(0)
        this.component = Animated.createAnimatedComponent(children)
        this.animations = Object.entries(to).map(([name, value]) => ({
            name,
            interpolate: this.animation.interpolate({
                inputRange: [0, 1],
                outputRange: [from[name] !== undefined ? from[name] : value, value],
            }),
        }))
        this.to = this.animations.reduce((acc, anim) => ({ ...acc, [anim.name]: anim.interpolate }), {})
    }

    update = props => {
        const currentValue = this.animation._value
        this.animation.stopAnimation()
        this.animation.setValue(0)
        const { to, from, interpolator } = props
        for (let anim of this.animations) {
            if (to[anim.name] !== anim.to) {
                anim.interpolate = this.animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [anim.interpolate._interpolation(currentValue), to[anim.name]],
                })
            }
        }
        this.to = this.animations.reduce((acc, anim) => ({ ...acc, [anim.name]: anim.interpolate }), {})
        this.props.interpolator(this.animation, { toValue: 1 }).start()
    }

    componentWillReceiveProps(props) {
        this.update(props)
    }

    componentDidMount() {
        this.props.interpolator(this.animation, { toValue: 1 }).start()
    }

    render() {
        const { children, to, ...rest } = this.props
        return React.createElement(this.component, { ...this.to, ...rest })
    }
}
