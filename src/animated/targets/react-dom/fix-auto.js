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

  // Collect to-state props
  const componentProps = native
    ? allProps.reduce(convert, forward)
    : { ...from, ...to, ...forward }

  // Setting height and scroll properties so that the measuring div will be
  // invisible and avoid a flash of unmeasured content
  const measuringDivStyle = { overflowY: 'auto', height: 0 };

  return (
    <div
      style={measuringDivStyle}
      ref={ref => {
        if (ref) {
          // Once it's rendered out, fetch bounds. Infer total content height
          // from the available scroll height of the 0-sized measuring div
          const height = ref.scrollHeight
          const width = ref.clientWidth

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
    </div>
  )
}
