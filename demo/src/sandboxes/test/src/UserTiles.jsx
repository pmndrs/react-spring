import React, { useEffect } from 'react'
import Tile from './Tile.jsx'

import { useSprings, animated } from 'react-spring'
import { useDrag } from 'react-use-gesture'

const fn = (active = false, currentIndex = 0, x = 0, y = 0) => index => {
  return active && index === currentIndex
    ? {
        x: 40 * index + x,
        y: y,
        zIndex: 1,
        immediate: true,
      }
    : {
        x: index * 40,
        y: 10,
        zIndex: 0,
        immediate: false,
      }
}

const UserTiles = ({ tiles }) => {
  const [springs, api] = useSprings(tiles.length, fn(), [tiles])

  useEffect(() => {
    console.log('springs', springs.length)
    console.log('controllers in springref', api.current.length)
  }, [springs, api])

  const handleDrag = ({
    args: [currentIndex, letter, value],
    active,
    movement: [mx, my],
    xy: [x, y],
  }) => {
    api.start(fn(active, currentIndex))

    if (!active) {
      console.log('handle drop here')
    }
  }

  const bind = useDrag(handleDrag)
  return (
    <div style={{ position: 'relative' }}>
      {springs.map((springProps, i) => {
        const { y, x } = springProps
        return (
          <animated.div
            key={tiles[i].id}
            {...bind(i, tiles[i].letter, tiles[i].value)}
            style={{ position: 'absolute', x, y }}>
            <Tile letter={i + tiles[i].letter} value={tiles[i].value} />
          </animated.div>
        )
      })}
    </div>
  )
}

export default UserTiles
