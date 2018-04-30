import React from 'react'
import ReactDOM from 'react-dom'
import AnimatedValue from '../../AnimatedValue'

const getValues = object => Object.keys(object).map(k => object[k])
const check = value => value === 'auto'
const convert = (acc, [name, value]) => ({
  ...acc,
  [name]: new AnimatedValue(value),
})
const overwrite = (width, height) => (acc, [name, value]) => ({
  ...acc,
  [name]: value === 'auto' ? (name === 'height' ? height : width) : value,
})

export default function fixAuto(spring, props) {
  const { native, children, from, to } = props

  // Dry-route props back if nothing's using 'auto' in there
  if (![...getValues(from), ...getValues(to)].some(check)) return

  const forward = spring.getForwardProps(props)
  const allProps = Object.entries({ ...from, ...to })
  const portal = document.createElement('div')
  portal.style.cssText = 'position:static;visibility:hidden;'
  document.body.appendChild(portal)

  // Collect to-state props
  const componentProps = native
    ? allProps.reduce(convert, forward)
    : { ...from, ...to, ...forward }

  // Render to-state vdom to portal
  return ReactDOM.createPortal(
    <div
      ref={ref => {
        if (ref) {
          // Once it's rendered out, fetch bounds
          const height = ref.clientHeight
          const width = ref.clientWidth

          // Remove portal and resolve promise with updated props
          document.body.removeChild(portal)
          // Defer to next frame, or else the springs updateToken is canceled
          requestAnimationFrame(() =>
            spring.updateProps(
              {
                ...props,
                from: Object.entries(from).reduce(
                  overwrite(width, height),
                  from
                ),
                to: Object.entries(to).reduce(overwrite(width, height), to),
              },
              true
            )
          )
        }
      }}>
      {children(componentProps)}
    </div>,
    portal
  )
}
