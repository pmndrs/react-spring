import React from 'react'
import { Transition, animated, interpolate } from 'react-spring'
import Node from './Node'
import { findCollapsedParent, getTopLeft } from './utils'

const keyAccessor = n => n.data.name

function Nodes({ nodes, layout, orientation, onNodeClick }) {
  return (
    <Transition
      native
      items={nodes}
      keys={keyAccessor}
      config={{ tension: 1000, friction: 130, mass: 5 }}
      from={node => {
        const parentTopLeft = getTopLeft(
          node.parent || { x: 0, y: 0 },
          layout,
          orientation
        )
        return {
          top: parentTopLeft.top,
          left: parentTopLeft.left,
          opacity: 0,
        }
      }}
      enter={node => {
        const topLeft = getTopLeft(node, layout, orientation)
        return {
          top: topLeft.top,
          left: topLeft.left,
          opacity: 1,
        }
      }}
      update={node => {
        const topLeft = getTopLeft(node, layout, orientation)
        return {
          top: topLeft.top,
          left: topLeft.left,
          opacity: 1,
        }
      }}
      leave={node => {
        const collapsedParent = findCollapsedParent(node.parent)
        const collapsedParentPrevPos = {
          x: collapsedParent.data.x0,
          y: collapsedParent.data.y0,
        }
        const topLeft = getTopLeft(collapsedParentPrevPos, layout, orientation)
        return {
          top: topLeft.top,
          left: topLeft.left,
          opacity: 0,
        }
      }}>
      {nodes.map(node => styles => {
        const key = keyAccessor(node)
        return (
          <animated.g
            className="cx-group"
            style={{
              cursor: 'pointer',
              pointerEvents: styles.opacity.interpolate(
                v => (v < 0.5 ? 'none' : 'all')
              ),
            }}
            width={40}
            height={20}
            opacity={styles.opacity}
            transform={interpolate(
              [styles.left, styles.top],
              (l, t) => `translate(${l}, ${t})`
            )}
            key={keyAccessor(node)}>
            <Node
              node={node}
              layout={layout}
              orientation={orientation}
              onClick={() => onNodeClick(node)}
              key={key}
            />
          </animated.g>
        )
      })}
    </Transition>
  )
}

export default Nodes
