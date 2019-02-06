import React, { useRef } from 'react'
import clamp from 'lodash/clamp'
import { useGesture } from 'react-with-gesture'
import { useSprings, animated, interpolate } from 'react-spring'
import './styles.css'

// Swaps two values in an array
const swap = (array, from, to) => (
  array.splice(to, 0, ...array.splice(from, 1)), array
)
// Returns fitting styles for dragged/idle items
const fn = (order, down, originalIndex, curIndex, y) => index =>
  down && index === originalIndex
    ? {
        y: curIndex * 60 + y,
        scale: 1.1,
        zIndex: '1',
        shadow: 16,
        immediate: n => n === 'y' || n === 'zIndex',
      }
    : {
        y: order.indexOf(index) * 60,
        scale: 1,
        zIndex: '0',
        shadow: 1,
        immediate: false,
      }

export default function DraggableList({
  items = ['Lorem', 'Ipsum', 'Dolor', 'Sit'],
}) {
  // Store indicies as a local ref, this represents the item order
  const order = useRef([0, 1, 2, 3])
  // Create springs, each corresponds to an item, controlling its transform, scale, etc.
  const [springs, setSprings] = useSprings(items.length, fn(order.current))

  // Preps a gesture handler which returns drag-deltas, touched/clicked state, etc.
  const bind = useGesture(({ args: [originalIndex], down, delta: [, y] }) => {
    // Bunch of math to calculate current row and new order, it's unavoidable ¯\_(ツ)_/¯
    const curIndex = order.current.indexOf(originalIndex)
    const curRow = clamp(
      Math.round((curIndex * 60 + y) / 60),
      0,
      items.length - 1
    )
    const newOrder = swap(order.current.slice(0), curIndex, curRow)
    // Feed springs new style data, they'll animate the view without causing a single render
    setSprings(fn(newOrder, down, originalIndex, curIndex, y))
    if (!down) order.current = newOrder
  })
  // Map resulting animated values to the actual items
  return (
    <div className="draggable-main">
      <div className="draggable-inner">
        {springs.map(({ zIndex, shadow, y, scale }, i) => (
          <animated.div
            key={i}
            style={{
              zIndex: zIndex,
              boxShadow: shadow.interpolate(
                s => `rgba(0, 0, 0, 0.2) 0px ${s}px ${2 * s}px 0px`
              ),
              transform: interpolate(
                [y, scale],
                (y, s) => `translate3d(0,${y}px,0) scale(${s})`
              ),
            }}
            children={items[i]}
            {...bind(i)}
          />
        ))}
      </div>
    </div>
  )
}
