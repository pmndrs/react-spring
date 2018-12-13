// Inpired by: https://codepen.io/popmotion/pen/xWrbNm?editors=0010

import React from 'react'
import { withGesture } from 'react-with-gesture'
import { Spring, animated } from 'react-spring'
import './styles.css'

class GesturesExample extends React.Component {
  render() {
    const { xDelta, down } = this.props
    const to = { x: down ? xDelta : 0 }
    return (
      <div className="gestures-main">
        <Spring native to={to} immediate={n => down && n === 'x'}>
          {({ x }) => (
            <animated.div
              className="gestures-item"
              style={{ backgroundColor: xDelta < 0 ? '#FF1C68' : '#14D790' }}>
              <animated.div
                className="gestures-bubble"
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
                className="gestures-fg"
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

// https://github.com/drcmda/react-with-gesture
export default withGesture(GesturesExample)
