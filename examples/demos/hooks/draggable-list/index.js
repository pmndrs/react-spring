import React, { useState, useEffect, useRef } from 'react'
import { useSprings } from 'react-spring/hooks'
import clamp from 'lodash-es/clamp'
import { useGesture } from './gesture'
import { Main, Container, Item } from './styles'

const swap = (a, from, to) => (a.splice(to, 0, ...a.splice(from, 1)), a)
const yFn = o => i => ({ y: o.indexOf(i) * 100, zIndex: '0', immediate: false })

function DraggableList({ items = ['LOREM', 'IPSUM', 'DOLOR', 'SIT'] }) {
  const order = useRef([0, 1, 2, 3])
  const [props, setSprings] = useSprings(items.length, yFn(order.current))
  const bind = useGesture(
    ({ args: [item, originalIndex], down, yDelta: y }) => {
      const idx = order.current.indexOf(originalIndex)
      const row = clamp(Math.floor((idx * 100 + y) / 100), 0, items.length - 1)
      const newOrder = swap(order.current.slice(0), idx, row)
      setSprings(i =>
        down && items[i] === item
          ? { y: idx * 100 + y, zIndex: '1', immediate: true }
          : yFn(newOrder)(i)
      )
      if (!down) order.current = newOrder
    }
  )

  return (
    <Main>
      <Container>
        {items.map((item, index) => (
          <Item
            {...bind(item, index)}
            style={{
              zIndex: props[index].zIndex,
              transform: props[index].y.interpolate(
                y => `translate3d(0,${y}px,0)`
              ),
            }}
            key={item}
            children={item}
          />
        ))}
      </Container>
    </Main>
  )
}

export default DraggableList
