import React from 'react'
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
          // Once it's rendered out, fetch bounds (minus padding/margin/borders)
          let width, height
          let cs = getComputedStyle(ref.node)
          if (cs.boxSizing === 'border-box') {
            width = ref.node.clientWidth
            height = ref.node.clientHeight
          } else {
            const paddingX =
              parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight)
            const paddingY =
              parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom)
            const borderX =
              parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth)
            const borderY =
              parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth)
            width = ref.node.offsetWidth - paddingX - borderX
            height = ref.node.offsetHeight - paddingY - borderY
          }
          // Defer to next frame, or else the springs updateToken is canceled
          const convert = overwrite(width, height)
          requestAnimationFrame(() =>
            spring.updateProps(
              {
                ...props,
                from: Object.entries(from).reduce(convert, from),
                to: Object.entries(to).reduce(convert, to),
              },
              true
            )
          )
        }
      }}
    />
  )
}
