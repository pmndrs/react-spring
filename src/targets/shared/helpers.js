import AnimatedValue from '../../animated/AnimatedValue'

export function shallowEqual(a, b) {
  for (let i in a) if (!(i in b)) return false
  for (let i in b) if (a[i] !== b[i]) return false
  return true
}

export function callProp(obj, state, ...args) {
  return typeof obj === 'function' ? obj(state, ...args) : obj
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
    reverse,
    force,
    immediate,
    impl,
    inject,
    delay,
    attach,
    destroyed,
    ...forward
  } = props
  return forward
}

export function renderChildren(props, componentProps) {
  const forward = { ...componentProps, ...getForwardProps(props) }
  return props.render
    ? props.render({ ...forward, children: props.children })
    : props.children(forward)
}

export function convertToAnimatedValue(acc, [name, value]) {
  return {
    ...acc,
    [name]: new AnimatedValue(value),
  }
}

export function convertValues(props) {
  const { from, to, native } = props
  const allProps = Object.entries({ ...from, ...to })
  return native
    ? allProps.reduce(convertToAnimatedValue, {})
    : { ...from, ...to }
}
