import React, { useState } from 'react'
import { useSpring, animated, config } from 'react-spring'
import './styles.css'

const AnimFeTurbulence = animated('feTurbulence')
const AnimFeColorMatrix = animated('feColorMatrix')
const AnimFeGaussianBlur = animated('feGaussianBlur')

export default function App() {
  const [open, toggle] = useState(false)
  const { freq, matrix, dev, transform, opacity } = useSpring({
    reverse: open,
    from: {
      opacity: 0,
      transform: 'scale(0)',
      dev: 7,
      freq: '0.03, 0.0',
      matrix: '1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 18 -10',
    },
    to: {
      opacity: 1,
      transform: 'scale(1)',
      dev: 0,
      freq: '0.0, 0.0',
      matrix: '1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0',
    },
    config: config.molasses,
  })

  return (
    <div className="liq-container" onClick={() => toggle(!open)}>
      <div className="liq-logo">
        <animated.svg
          style={{ transform, opacity }}
          className="iq-logo__device"
          viewBox="0 0 500 500">
          <defs>
            <filter id="turb2">
              <AnimFeTurbulence
                id="iq-turb"
                type="fractalNoise"
                baseFrequency={freq}
                numOctaves="10"
                result="TURB"
                seed="8"
              />
              <feDisplacementMap
                xChannelSelector="R"
                yChannelSelector="G"
                in="SourceGraphic"
                in2="TURB"
                result="DISP"
                scale="130"
              />
              <AnimFeGaussianBlur
                id="blur"
                in="DISP"
                stdDeviation={dev}
                result="BLUR"
              />
              <AnimFeColorMatrix
                id="matrix"
                in="BLUR"
                mode="matrix"
                values={matrix}
                result="GOO"
              />
            </filter>
          </defs>
          <g filter="url(#turb2)">
            <path
              className="iq-logo__device-small"
              d="M333.63,222H403l-37,72.69A50,50,0,0,1,321.41,322H252l37-72.69A50,50,0,0,1,333.63,222Z"
              fill="#fff"
            />
            <path
              className="iq-logo__device-large"
              d="M260.28,122h69.39L209.94,356.72A50,50,0,0,1,165.39,384H96L215.72,149.29A50,50,0,0,1,260.28,122Z"
              fill="#fff"
            />
          </g>
        </animated.svg>
      </div>
    </div>
  )
}
