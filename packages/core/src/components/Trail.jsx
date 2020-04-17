import React from 'react'
import { is } from 'shared'
import { useTrail } from '../hooks'

export function Trail({ items, children, ...props }) {
  const trails = useTrail(items.length, props)
  return (
    <>
      {items.map((item, index) => {
        const result = children(item, index)
        return is.fun(result) ? result(trails[index]) : result
      })}
    </>
  )
}
