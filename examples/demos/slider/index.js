// Inpired by: https://codepen.io/popmotion/pen/xWrbNm?editors=0010

import React from 'react'
import { useSpring, animated, interpolate } from 'react-spring'
import { useGesture } from 'react-with-gesture'
import './styles.css'

export default function Slider({ children }) {
  // See: https://github.com/drcmda/react-with-gesture
  // Gives access to: down, x, y, xDelta, yDelta, xInitial, yInitial
  const [handlers, { delta, down }] = useGesture()
  const { x, bg, size } = useSpring({
    x: down ? delta[0] : 0,
    bg: `linear-gradient(120deg, ${
      delta[0] < 0 ? '#f093fb 0%, #f5576c' : '#96fbc4 0%, #f9f586'
    } 100%)`,
    size: down ? 1.1 : 1,
    immediate: name => down && name === 'x',
  })
  const avSize = x.interpolate({
    map: Math.abs,
    range: [50, 300],
    output: ['scale(0.5)', 'scale(1)'],
    extrapolate: 'clamp',
  })
  return (
    <div className="slider-main">
      <animated.div
        {...handlers()}
        className="slider-item"
        style={{ background: bg }}>
        <animated.div
          className="slider-av"
          style={{
            transform: avSize,
            justifySelf: delta[0] < 0 ? 'end' : 'start',
          }}
        />
        <animated.div
          className="slider-fg"
          style={{
            transform: interpolate(
              [x, size],
              (x, s) => `translate3d(${x}px,0,0) scale(${s})`
            ),
          }}>
          Slide
        </animated.div>
      </animated.div>
    </div>
  )
}
