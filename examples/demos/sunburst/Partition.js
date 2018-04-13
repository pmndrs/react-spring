import React from 'react'
import cx from 'classnames'
import { Group } from '@vx/group'
import { partition as d3partition } from 'd3-hierarchy'
import { HierarchyDefaultNode as DefaultNode } from '@vx/hierarchy'

export default function Partition({
  top,
  left,
  className,
  root,
  size,
  round,
  padding,
  children,
  nodeComponent = DefaultNode,
  ...restProps
}) {
  const partition = d3partition()
  if (size) partition.size(size)
  if (round) partition.round(round)
  if (padding) partition.padding(padding)

  const data = partition(root)
  const links = data.links()
  const descendants = root.descendants()

  return (
    <Group top={top} left={left} className={cx('vx-partition', className)}>
      {children}
    </Group>
  )
}
