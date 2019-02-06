import React, { useRef, useEffect } from 'react'
import clamp from 'lodash-es/clamp'
import { useSprings, animated } from 'react-spring'
import { useGesture } from 'react-with-gesture'
import './styles.css'

const pages = [
  'https://images.pexels.com/photos/62689/pexels-photo-62689.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
  'https://images.pexels.com/photos/296878/pexels-photo-296878.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
  'https://images.pexels.com/photos/1509428/pexels-photo-1509428.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
  'https://images.pexels.com/photos/351265/pexels-photo-351265.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
  'https://images.pexels.com/photos/924675/pexels-photo-924675.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
]

export default function Viewpager() {
  const width = useRef()
  const index = useRef(0)
  const [props, set] = useSprings(pages.length, i => ({
    x: i * window.innerWidth,
    sc: 1,
    display: 'none',
  }))

  useEffect(() => {
    set(i => ({ x: i * width.current, sc: 1, display: 'block' }))
  }, [])

  const bind = useGesture(
    ({ down, delta: [xDelta], direction: [xDir], distance, cancel }) => {
      if (down && distance > width.current / 2)
        cancel(
          (index.current = clamp(
            index.current + (xDir > 0 ? -1 : 1),
            0,
            pages.length - 1
          ))
        )
      set(i => {
        if (i < index.current - 1 && i > index.current + 1)
          return { display: 'none' }
        const x = (i - index.current) * width.current + (down ? xDelta : 0)
        const sc = down ? 1 - distance / width.current / 2 : 1
        return { x, sc, display: 'block' }
      })
    }
  )
  return (
    <div
      ref={r => r && (width.current = r.getBoundingClientRect().width)}
      className="viewpager-main">
      {props.map(({ x, display, sc }, i) => (
        <animated.div
          {...bind()}
          key={i}
          style={{
            display,
            transform: x.interpolate(x => `translate3d(${x}px,0,0)`),
          }}>
          <animated.div
            style={{
              transform: sc.interpolate(s => `scale(${s})`),
              backgroundImage: `url(${pages[i]})`,
            }}
          />
        </animated.div>
      ))}
    </div>
  )
}
