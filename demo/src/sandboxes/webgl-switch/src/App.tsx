import React, { useState, useEffect, Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { useGLTF, useTexture, Shadow, meshBounds } from "@react-three/drei"
import { animated, SpringValue, useSpring } from "@react-spring/web"
import { a } from "@react-spring/three"

function Switch({ x, set }: { set: React.Dispatch<React.SetStateAction<number>>; x: SpringValue<number> }) {
  const { nodes, materials } = useGLTF("/switch.glb")
  const texture = useTexture("/cross.jpg")
  // Hover state
  const [hovered, setHover] = useState(false)
  useEffect(() => void (document.body.style.cursor = hovered ? "pointer" : "auto"), [hovered])
  // Events
  const onClick = () => set((toggle) => Number(!toggle))
  const onPointerOver = () => setHover(true)
  const onPointerOut = () => setHover(false)
  // Interpolations
  const pZ = x.to([0, 1], [-1.2, 1.2])
  const rX = x.to([0, 1], [0, Math.PI * 1.3])
  const color = x.to([0, 1], ["#888", "#2a2a2a"])

  return (
    <group scale={[1.25, 1.25, 1.25]} dispose={null}>
      <a.mesh receiveShadow castShadow material={materials.track} geometry={nodes.Cube.geometry} material-color={color} material-roughness={0.5} material-metalness={0.8} />
      <a.group position-y={0.85} position-z={pZ}>
        <a.mesh receiveShadow castShadow raycast={meshBounds} rotation-x={rX} onClick={onClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
          <sphereGeometry args={[0.8, 64, 64]} />
          <a.meshStandardMaterial roughness={0.5} map={texture} />
        </a.mesh>
        <a.pointLight intensity={100} distance={1.4} color={color} />
        <Shadow renderOrder={-1000} position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={1.5} />
      </a.group>
    </group>
  )
}

export default function App() {
  const [toggle, set] = useState(0)
  // Set up a shared spring which simply animates the toggle above
  // We use this spring to interpolate all the colors, position and rotations
  const [{ x }] = useSpring({ x: toggle, config: { mass: 5, tension: 1000, friction: 50, precision: 0.0001 } }, [toggle])

  const color = x.to([0, 1], ["#7fffd4", "#c72f46"])

  return (
    <animated.div className="container" style={{ backgroundColor: x.to([0, 1], ["#c9ffed", "#ff2558"]), color: x.to([0, 1], ["#7fffd4", "#c70f46"]) }}>
      <h1 className="open" children="<h1>" />
      <h1 className="close" children="</h1>" />
      <animated.h1>{x.to((x) => (x + 8).toFixed(2))}</animated.h1>
      <Canvas orthographic shadows dpr={[1, 2]} camera={{ zoom: 60, position: [-10, 10, 10], fov: 35 }}>
        <ambientLight intensity={0.1} />
        <directionalLight position={[-20, 20, 20]} intensity={1} />
        <a.directionalLight position={[-20, -20, -20]} intensity={0.5} color={color} />
        <a.pointLight position={[0, 0, 5]} distance={5} intensity={5} color={color} />
        <a.spotLight color={color} position={[10, 20, 20]} angle={0.1} intensity={2} shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.00001} castShadow />
        <Suspense fallback={null}>
          <Switch x={x} set={set} />
        </Suspense>
        <mesh receiveShadow renderOrder={1000} position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[10, 10]} />
          <a.shadowMaterial transparent opacity={x.to((x) => 0.1 + x * 0.2)} />
        </mesh>
      </Canvas>
    </animated.div>
  )
}
