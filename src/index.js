import React from 'react'
import PropTypes from 'prop-types'
import Animated from './animated/index'

function createInterpolator(interpolator) {
    return class extends React.PureComponent {
        static propTypes = {
            to: PropTypes.object,
            from: PropTypes.object,
            config: PropTypes.object,
            native: PropTypes.bool,
        }
        static defaultProps = { to: {}, from: {}, config: { tension: 170, friction: 26 }, native: false }

        constructor(props) {
            super()
            const { children, to, from, native } = props
            this._animation = new Animated.Value(0)
            this._original = children
            this._component = native ? children : Animated.createAnimatedComponent(children)
            this._updateInterpolations(props)
        }

        _mapValues(props, name, value, index) {
            const { from } = props
            const currentValue = this._animation._value
            let interpolate, overrideFrom
            if (Array.isArray(value)) {
                interpolate = value.map((array, i) => {
                    const [key, value] = Object.entries(array)[0]
                    const [fromValue] = (from && from[name] && from[name][i] && Object.values(from[name][i])) || [value]
                    const previousValue =
                        this._interpolations &&
                        this._interpolations[index] &&
                        Object.values(this._interpolations[index].interpolate[i])[0]._interpolation(currentValue)
                    return {
                        [key]: this._animation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [previousValue !== undefined ? previousValue : fromValue, value],
                        }),
                    }
                })
            } else {
                const previous =
                    this._interpolations &&
                    this._interpolations[index] &&
                    this._interpolations[index].interpolate._interpolation(currentValue)
                const fromValue = previous !== undefined ? previous : from[name] !== undefined ? from[name] : value
                interpolate = this._animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [overrideFrom !== undefined ? overrideFrom : fromValue, value],
                })
            }
            return { name, interpolate }
        }

        _updateInterpolations = props => {
            const { to } = props
            this._interpolations = Object.entries(to).map(([n, v], i) => this._mapValues(props, n, v, i))
            this._to = this._interpolations.reduce((acc, anim) => ({ ...acc, [anim.name]: anim.interpolate }), {})
        }

        _updateAnimations = props => {
            const { to, from, config } = props
            this._updateInterpolations(props)
            this._animation.stopAnimation()
            this._animation.setValue(0)
            interpolator(this._animation, { toValue: 1, ...config }).start()
        }

        componentWillReceiveProps(props) {
            if (props.children !== this._original) {
                // So, this is probably the weirdest issue that has to be dealt.
                // People seem to advocate render props, but in a way that re-calls the anonomous child function
                // on every render. Since Animated wraps it into an animatedComponent we first tried to cut down
                // on the re-creation by doing it only once, but that would freeze the component for ever and it
                // becomes stale. Instead, this check at least tries to benefit those that don't re-do their
                // render functions, the rest will suffer through weird issue.
                this._original = props.children
                this._component = props.native ? props.children : Animated.createAnimatedComponent(props.children)
            }
            this._updateAnimations(props)
        }

        componentDidMount() {
            interpolator(this._animation, { toValue: 1, ...this.props.config }).start()
        }

        componentWillUnmount() {
            this._animation.stopAnimation()
        }

        render() {
            const { from, to, config, native, ...rest } = this.props
            return React.createElement(this._component, { ...this._to, ...rest })
        }
    }
}

const Spring = createInterpolator(Animated.spring)
const animated = Animated
export { createInterpolator, Spring, animated }
