import { useRef, useLayoutEffect } from 'react'
import AnimatedValue from '../animated/AnimatedValue'
import AnimatedArray from '../animated/AnimatedArray'

export function usePrevious (value, initialValue = null) {
  const ref = useRef(initialValue)
  useLayoutEffect(() => void (ref.current = value), [value])
  return ref
}

export class Queue {
  constructor () {
    this.queue = []
    this.offset = 0
  }
  get length () {
    return this.queue.length - this.offset
  }

  isEmpty () {
    return this.queue.length === 0
  }
  enqueue (item) {
    this.queue.push(item)
  }

  dequeue () {
    // const { queue, offset } = this
    if (this.queue.length == 0) return undefined

    const item = this.queue[this.offset]

    if (++this.offset * 2 >= this.queue.length) {
     this.queue = this.queue.slice(this.offset)
      this.offset = 0
    }
    return item
  }
  clear () {
    this.queue = []
    this.offset = 0
  }
  peek () {
    const { queue, offset } = this
    return queue.length > 0 ? queue[offset] : undefined
  }
}

export function debounce (func, delay = 0) {
  let timeoutId
  return function () {
    const context = this
    const args = arguments
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(context, args), delay)
  }
}
export function withDefault (value, defaultValue) {
  return value === undefined || value === null ? defaultValue : value
}

export function toArray (a) {
  return a !== void 0 ? (Array.isArray(a) ? a : [a]) : []
}

export function shallowEqual (a, b) {
  if (typeof a !== typeof b) return false
  if (typeof a === 'string' || typeof a === 'number') return a === b
  let i
  for (i in a) if (!(i in b)) return false
  for (i in b) if (a[i] !== b[i]) return false
  return i === void 0 ? a === b : true
}

export function callProp (obj, state, ...args) {
  return typeof obj === 'function' ? obj(state, ...args) : obj
}

export function getValues (object) {
  return Object.keys(object).map(k => object[k])
}

export function getForwardProps (props) {
  const {
    to,
    from,
    config,
    native,
    onStart,
    onRest,
    onFrame,
    children,
    reset,
    reverse,
    force,
    immediate,
    impl,
    inject,
    delay,
    attach,
    destroyed,
    track,
    interpolateTo,
    autoStart,
    ref,
    ...forward
  } = props
  return forward
}

export function interpolateTo (props) {
  const forward = getForwardProps(props)
  const rest = Object.keys(props).reduce(
    (a, k) => (forward[k] !== void 0 ? a : { ...a, [k]: props[k] }),
    {}
  )
  return { to: forward, ...rest }
}

export function convertToAnimatedValue (acc, [name, value]) {
  return {
    ...acc,
    [name]: new (Array.isArray(value) ? AnimatedArray : AnimatedValue)(value)
  }
}

export function convertValues (props) {
  const { from, to, native } = props
  const allProps = Object.entries({ ...from, ...to })
  return native
    ? allProps.reduce(convertToAnimatedValue, {})
    : { ...from, ...to }
}

export function handleRef (ref, forward) {
  if (forward) {
    // If it's a function, assume it's a ref callback
    if (typeof forward === 'function') forward(ref)
    else if (typeof forward === 'object')
    // If it's an object and has a 'current' property, assume it's a ref object
    { forward.current = ref }
  }
  return ref
}
