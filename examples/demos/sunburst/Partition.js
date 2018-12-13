import React from 'react'
import cx from 'classnames'
import { Group } from '@vx/group'
import { partition as d3partition } from 'd3-hierarchy'

export default function Partition({
  top,
  left,
  className,
  root,
  size,
  round,
  padding,
  children,
  ...restProps
}) {
  const partition = d3partition()
  if (size) partition.size(size)
  if (round) partition.round(round)
  if (padding) partition.padding(padding)
  partition(root)
  return (
    <Group top={top} left={left} className={cx('vx-partition', className)}>
      {children}
    </Group>
  )
}
