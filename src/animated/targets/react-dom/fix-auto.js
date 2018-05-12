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
  [name]: value === 'auto' ? (~name.indexOf('height') ? height : width) : value,
})

export default function fixAuto(spring, props) {
  const { native, children, render, from, to } = props

  // Dry-route props back if nothing's using 'auto' in there
  if (![...getValues(from), ...getValues(to)].some(check)) return

  // Fetch render v-dom
  const element = spring.renderChildren(props, spring.convertValues(props))

  // Return v.dom with injected ref
  return (
    <element.type
      {...element.props}
      ref={ref => {
        if (ref) {
          // Once it's rendered out, fetch bounds
          const o = overwrite(ref.node.clientWidth, ref.node.clientHeight)
          // Defer to next frame, or else the springs updateToken is canceled
          requestAnimationFrame(() =>
            spring.updateProps(
              {
                ...props,
                from: Object.entries(from).reduce(o, from),
                to: Object.entries(to).reduce(o, to),
              },
              true
            )
          )
        }
      }}
    />
  )
}
