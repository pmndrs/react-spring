import React from 'react'
import PropTypes from 'prop-types'
import Spring, { config as springConfig } from './Spring'

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

    getValues() {
        return this.instance && this.instance.getValues()
    }

    render() {
        const {
            children,
            render,
            from = {},
            to = {},
            native = false,
            config = springConfig.default,
            keys,
            onRest,
            ...extra
        } = this.props
        const animations = new Set()
        const hook = (index, animation) => {
            animations.add(animation)
            if (index === 0) return undefined
            else return Array.from(animations)[index - 1]
        }
        const props = { ...extra, native, config, from, to }
        const target = (render || children)
        return target.map((child, i) => {
            const attachedHook = animation => hook(i, animation)
            return <Spring ref={ref => i === 0 && (this.instance = ref)} onRest={i === 0 ? onRest : null} key={keys[i]} {...props} attach={attachedHook} render={render && child} children={render ? children : child} />
        })
    }
}
