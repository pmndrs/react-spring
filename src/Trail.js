import React from 'react'
import PropTypes from 'prop-types'
import Animated from './animated/targets/react-dom'
import Spring, { config } from './Spring'

export default class Trail extends React.PureComponent {
    static propTypes = {
        native: PropTypes.bool,
        config: PropTypes.object,
        from: PropTypes.object,
        to: PropTypes.object,
        keys: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
        children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
        render: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
    }
    static defaultProps = { from: {}, to: {}, native: false, config: config.default }
    render() {
        const { children, render, from, to, native, config, keys, ...extra } = this.props
        const animations = new Set()
        const hook = (index, animation) => {
            animations.add(animation)
            if (index === 0) return undefined
            else return Array.from(animations)[index - 1]
        }
        const props = { ...extra, native, config, from, to }
        return (render || children).map((child, i) => {
            const attachedHook = animation => hook(i, animation)
            return <Spring key={keys[i]} {...props} attach={attachedHook} render={render && child} children={render ? children : child} />
        })
    }
}
