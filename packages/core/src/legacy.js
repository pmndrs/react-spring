import React from 'react'
import { useSpring } from './useSpring'
import { useTrail } from './useTrail'
import { useTransition } from './useTransition'
import { is } from 'shared'

export function Spring({ children, ...props }) {
  return children(useSpring(props))
}

export function Trail({ items, children, ...props }) {
  const trails = useTrail(items.length, props)
  return items.map((item, index) => {
    const result = children(item, index)
    return is.fun(result) ? result(trails[index]) : result
  })
}

export function Transition({ items, keys = null, children, ...props }) {
  const transitions = useTransition(items, keys, props)
  return transitions.map(({ item, key, props, phase }, index) => {
    const result = children(item, phase, index)
    const element = is.fun(result) ? result(props) : result
    return element && element.type ? (
      <element.type {...element.props} key={key} ref={element.ref} />
    ) : (
      element
    )
  })
}
