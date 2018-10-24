import React, { Component } from 'react'
import { Stage, Layer } from 'react-konva'
import { Keyframes, animated } from '../../../../src/targets/konva'

const Animation = Keyframes.Spring(async next => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await next({
      native: true,
      config: { duration: 2000 },
      from: { dash: [0, 0, 0, 0, 20, 0, 0, 10] },
      to: { dash: [0, 0, 0, 10, 20, 0, 0, 0] },
    })
    await next({
      native: true,
      config: { duration: 500 },
      to: { dash: [20, 0, 0, 10, 0, 0, 0, 0] },
    })
    await next({
      native: true,
      immediate: true,
      to: { dash: [0, 0, 0, 0, 20, 0, 0, 10] },
    })
  }
})

export default class App extends Component {
  render() {
    return (
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          <Animation>
            {animation => {
              return (
                <animated.Line
                  points={[10, 0, 10, 120, 300, 120, 300, 500]}
                  stroke="black"
                  opacity={0.5}
                  strokeWidth={3}
                  {...animation}
                />
              )
            }}
          </Animation>
        </Layer>
      </Stage>
    )
  }
}
