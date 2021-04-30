import React from 'react'
import { Parallax, ParallaxLayer, IParallax } from '@react-spring/parallax'

export default function App() {
  const flexCenter = { display: 'flex', justifyContent: 'center', alignItems: 'center' }
  return (
    <>
      <div
        style={{
          background: 'linear-gradient(#e66465, #9198e5)',
          position: 'absolute',
          top: '0',
          width: '100vw',
          height: '100vh',
        }}
      />

      <Parallax pages={5}>
        <ParallaxLayer offset={1} speed={1.5}>
          <div style={{ width: '25%', height: '100%', marginRight: 'auto', backgroundColor: 'rebeccapurple' }} />
        </ParallaxLayer>

        <ParallaxLayer offset={1} speed={-2.5}>
          <div style={{ width: '25%', height: '100%', marginLeft: 'auto', backgroundColor: 'green' }} />
        </ParallaxLayer>

        <ParallaxLayer offset={0} speed={0.5} style={{ ...flexCenter }}>
          <p>Scroll down</p>
        </ParallaxLayer>

        <ParallaxLayer offset={1} sticky={3} speed={0} style={{ ...flexCenter }}>
          <div style={{ ...flexCenter, height: '10rem', width: '50%', backgroundColor: '#ff6d6d' }}>
            <p>Should be sticky</p>
          </div>
        </ParallaxLayer>
      </Parallax>
    </>
  )
}
