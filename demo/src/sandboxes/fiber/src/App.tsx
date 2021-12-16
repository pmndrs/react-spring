// All hooks are cross platform now
import React, { useState, useEffect } from "react"
// Platform knowledge is in here ...
import { a, useSpring } from "@react-spring/web"
import { invalidate } from "@react-three/fiber"
import { Scene } from "./Canvas"

export default function App() {
  const [toggle, set] = useState(0)
  // Set up a shared spring which simply animates the toggle above
  // We use this spring to interpolate all the colors, position and rotations
  const { x } = useSpring({ x: toggle, config: { mass: 5, tension: 1000, friction: 50, precision: 0.0001 } })

  useEffect(() => {
    invalidate()
  }, [toggle])
  return (
    <a.div className="container" style={{ backgroundColor: x.to([0, 1], ["#c9ffed", "#ff2558"]), color: x.to([0, 1], ["#7fffd4", "#c70f46"]) }}>
      <h1 className="open" children="<h1>" />
      <h1 className="close" children="</h1>" />
      <a.h1>{x.to((x) => (x + 8).toFixed(2))}</a.h1>
      <Scene x={x} set={set} />
    </a.div>
  )
}
