import React from 'react'
import { useSpring } from './useSpring'
import { useTrail } from './useTrail'
import { useTransition } from './useTransition'
import { is } from './shared/helpers'

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
  return transitions.map(({ item, key, props, slot }, index) => {
    const result = children(item, slot, index)
    const element = is.fun(result) ? result(props) : result
    return element && <element.type key={key} {...element.props} />
  })
}
