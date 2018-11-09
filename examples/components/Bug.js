import React from 'react'
import ReactDOM from 'react-dom'
import { Keyframes, animated } from 'react-spring'

const Fader = Keyframes.Spring(async spring => {
  //while (true) {
    await spring({ opacity: 1, from: { opacity: 0 }, reset: true })
    console.log('---> first pass')
    await spring({ opacity: 1, from: { opacity: 0 }, reset: true })
    console.log('---> 2nd pass')
  //}
})

export default function App() {
  return (
    <div className="App">
      <Fader native>{style => <animated.h1 style={style}>Hello CodeSandbox</animated.h1>}</Fader>
    </div>
  )
}