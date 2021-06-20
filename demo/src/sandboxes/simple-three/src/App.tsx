import React from 'react'
import './styles.css'

import { Canvas } from '@react-three/fiber'
import { useSpring, animated } from '@react-spring/three'

export default function Thing() {
  const { position } = useSpring({
    position: 0,
    from: { position: -200 },
    config: { mass: 5, tension: 500, friction: 150 },
    loop: { reverse: true }
  })

  return (
    <Canvas>
      <animated.mesh position={position}>
        <boxBufferGeometry attach="geometry" args={[3, 3, 3]} />
        <meshNormalMaterial attach="material" />
      </animated.mesh>
    </Canvas>
  )
}
