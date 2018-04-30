// Inpired by: https://codepen.io/popmotion/pen/xWrbNm?editors=0010

import React from 'react'
import { withGesture } from 'react-with-gesture'
import { Spring, animated } from 'react-spring'
import './styles.css'

@withGesture // https://github.com/drcmda/react-with-gesture
export default class GesturesExample extends React.Component {
  render() {
    const { xDelta, down, children } = this.props
    const to = { x: down ? xDelta : 0 }
    return (
      <div className="gestures-main" style={{ gridColumn: 'span 2' }}>
        <Spring native to={to} immediate={n => down && n === 'x'}>
          {({ x }) => (
            <animated.div
              className="item"
              style={{ backgroundColor: xDelta < 0 ? '#FF1C68' : '#14D790' }}>
              <animated.div
                className="bubble"
                style={{
                  transform: x
                    .interpolate({
                      map: Math.abs,
                      range: [50, 300],
                      output: [0.5, 1],
                      extrapolate: 'clamp',
                    })
                    .interpolate(x => `scale(${x})`),
                  justifySelf: xDelta < 0 ? 'end' : 'start',
                }}
              />
              <animated.div
                className="fg"
                style={{
                  transform: x.interpolate(x => `translate3d(${x}px,0,0)`),
                }}>
                Slide me
              </animated.div>
            </animated.div>
          )}
        </Spring>
      </div>
    )
  }
}
