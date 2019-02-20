import React from 'react'
import { useSpring } from './useSpring'
import { useTrail } from './useTrail'
import { useTransition } from './useTransition'
import { is } from './shared/helpers'

export function Spring({ children, ...props }) {
  const spring = useSpring(props)
  return children(spring)
}

export function Trail({ items, children, ...props }) {
  const trails = useTrail(items.length, props)
  return items.map((item, index) => children(item)(trails[index]))
}

export function Transition({ items, keys = null, children, ...props }) {
  const transitions = useTransition(items, keys, props)
  return transitions.map(({ item, key, props, slot }, index) => {
    const el = children(item, slot, index)(props)
    return <el.type key={key} {...el.props} />
  })
}
