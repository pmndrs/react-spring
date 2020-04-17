import React from 'react'
import { useTransition } from '../hooks'

export function Transition({ items, children, ...props }) {
  return <>{useTransition(items, props)(children)}</>
}
