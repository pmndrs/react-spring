import React, { useRef } from 'react'
import { Switch, Route, Link } from 'wouter'
import { Parallax, ParallaxLayer, IParallax } from '../../src'
import './App.css'

interface BaseDemoProps {
  horizontal?: boolean
}

const BaseDemo = ({ horizontal = false }: BaseDemoProps) => {
  const parallax = useRef<IParallax>(null)

  const scroll = (to: number) => {
    if (parallax.current) {
      parallax.current.scrollTo(to)
    }
  }

  return (
    <Parallax
      ref={parallax}
      pages={3}
      horizontal={horizontal}
      className="container">
      <ParallaxLayer
        horizontal={!horizontal}
        offset={1.5}
        speed={1.5}
        className="opposite-horizontal"
      />

      <ParallaxLayer offset={1} speed={1} className="parent-horizontal" />

      <ParallaxLayer sticky={{ start: 1, end: 2 }} className="sticky">
        <div className="sticky-content flex-center">Sticky</div>
      </ParallaxLayer>

      <ParallaxLayer className="flex-center">
        <button onClick={() => scroll(1)} data-test="scroll-button">
          Scroll
        </button>
      </ParallaxLayer>
    </Parallax>
  )
}

function App() {
  return (
    <Switch>
      <Route path="/">
        <h1>Parallax Test Demos</h1>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Link href="/vertical">Vertical</Link>
          <Link href="/horizontal">Horizontal</Link>
        </div>
      </Route>
      <Route path="/vertical">
        <BaseDemo />
      </Route>
      <Route path="/horizontal">
        <BaseDemo horizontal />
      </Route>
    </Switch>
  )
}

export default App
