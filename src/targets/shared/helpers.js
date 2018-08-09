import AnimatedValue from '../../animated/AnimatedValue'

export function shallowDiff(a, b) {
  if (!!a !== !!b) return false
  for (let i in a) if (!(i in b)) return true
  for (let i in b) if (a[i] !== b[i]) return true
  return false
}

export function callProp(arg, state) {
  return typeof arg === 'function' ? arg(state) : arg
}

export function getValues(object) {
  return Object.keys(object).map(k => object[k])
}

export function getForwardProps(props) {
  const {
    to,
    from,
    config,
    native,
    onRest,
    onFrame,
    children,
    render,
    reset,
    immediate,
    impl,
    inject,
    delay,
    attach,
    ...forward
  } = props
  return forward
}

export function renderChildren(props, componentProps) {
  return props.render
    ? props.render({ ...componentProps, children: props.children })
    : props.children(componentProps)
}

export function convertToAnimatedValue(acc, [name, value]) {
  return {
    ...acc,
    [name]: new AnimatedValue(value),
  }
}

export function convertValues(props) {
  const { from, to, native, children, render } = props
  const forward = getForwardProps(props)
  const allProps = Object.entries({ ...from, ...to })
  return native
    ? allProps.reduce(convertToAnimatedValue, forward)
    : { ...from, ...to, ...forward }
}
