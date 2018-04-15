import React from 'react'
import ReactDOM from 'react-dom'
import { Value } from 'react-spring'

export default function fixAuto(props) {
    return new Promise(res => {
        const { native, children, from, to, ...extra } = props

        // Create portal
        const portal = document.createElement('div')
        portal.style.cssText = 'position:static;visibility:hidden;'
        document.body.appendChild(portal)

        // Call children with to-state
        const componentProps = native
            ? Object.entries({ ...from, ...to }).reduce((acc, [name, value]) => ({ ...acc, [name]: new Value(value) }), {})
            : { ...from, ...to }
        const result = children({ ...componentProps, ...extra })

        // Render to-state vdom to portal
        ReactDOM.render(
            <div
                ref={ref => {
                    if (ref) {
                        // Once it's rendered out, fetch bounds
                        const height = ref.clientHeight
                        const width = ref.clientWidth

                        // Remove portal and resolve promise with updated props
                        document.body.removeChild(portal)
                        let newToProps = {}
                        Object.entries(to).forEach(
                            ([name, value]) => value === 'auto' && (newToProps[name] = name === 'height' ? height : width),
                        )
                        res({ ...props, to: newToProps })
                    }
                }}>
                {result}
            </div>,
            portal,
        )
    })
}
