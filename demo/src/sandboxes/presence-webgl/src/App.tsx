import * as React from 'react'
import { Canvas } from '@react-three/fiber'
import { Float, MeshReflectorMaterial, PointMaterial } from '@react-three/drei'
import { animated, usePresence, SpringValue } from '@react-spring/web'
import { a } from '@react-spring/three'

import styles from './styles.module.css'

const ACCENT = '#a78bfa'

// drei's <Sparkles> keeps opacity in a per-point attribute that can't be
// animated, so these are plain points with a material whose opacity can.
const SPARKS = Float32Array.from(
  { length: 40 * 3 },
  () => (Math.random() - 0.5) * 4
)
const AnimatedPointMaterial = a(PointMaterial)

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'
const subscribe = (onChange: () => void) => {
  const mql = window.matchMedia(REDUCED_MOTION)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}
const usePrefersReducedMotion = () =>
  React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(REDUCED_MOTION).matches
  )

function Crystal({ t, reduced }: { t: SpringValue<number>; reduced: boolean }) {
  return (
    <>
      {/* With reduced motion, the crystal fades in place instead of rising. */}
      <a.group
        position-y={reduced ? 0.9 : t.to([0, 1], [-1.2, 0.9])}
        rotation-y={reduced ? 0 : t.to(v => (1 - v) * Math.PI * 1.5)}
        scale={reduced ? 0.6 : t.to(v => 0.2 + 0.4 * v)}
      >
        <Float speed={2} floatIntensity={0.6} rotationIntensity={0.6}>
          <mesh>
            <icosahedronGeometry args={[0.7, 0]} />
            <a.meshStandardMaterial
              color="#2e1065"
              emissive={ACCENT}
              emissiveIntensity={t.to(v => v * 0.35)}
              roughness={0.25}
              metalness={0.2}
              flatShading
              transparent
              opacity={reduced ? t : 1}
            />
          </mesh>
          <points>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[SPARKS, 3]}
              />
            </bufferGeometry>
            <AnimatedPointMaterial
              color={ACCENT}
              size={0.08}
              transparent
              depthWrite={false}
              opacity={t}
            />
          </points>
        </Float>
        <a.pointLight color={ACCENT} intensity={t.to(v => v * 12)} />
      </a.group>
      <a.mesh
        rotation-x={-Math.PI / 2}
        position-y={0.01}
        scale={reduced ? 1 : t.to(v => 0.4 + 0.6 * v)}
      >
        <ringGeometry args={[0.7, 0.74, 64]} />
        <a.meshBasicMaterial
          color={ACCENT}
          transparent
          opacity={t.to(v => v * 0.7)}
        />
      </a.mesh>
    </>
  )
}

export default function App() {
  const [open, setOpen] = React.useState(false)
  const toggle = () => setOpen(o => !o)
  const reduced = usePrefersReducedMotion()

  // One spring, `t`, drives the canvas and the DOM caption alike. A rare,
  // playful summon may bounce; the dismissal is critically damped and quicker.
  const summoned = usePresence(open, {
    from: { t: 0 },
    enter: { t: 1 },
    leave: { t: 0, config: { mass: 1, tension: 280, friction: 34 } },
    config: { mass: 1.2, tension: 170, friction: 18 },
  })

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // A focused button already toggles on Space.
      if (e.code === 'Space' && !(e.target instanceof HTMLButtonElement)) {
        e.preventDefault()
        toggle()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.stage} onClick={toggle}>
        <Canvas dpr={[1, 2]} camera={{ position: [0, 1.4, 6], fov: 40 }}>
          <color attach="background" args={['#07060d']} />
          <fog attach="fog" args={['#07060d', 5, 12]} />
          <ambientLight intensity={0.3} />
          <directionalLight position={[3, 5, 2]} intensity={1.2} />
          <pointLight position={[-3, 2, 2]} intensity={30} color="#f472b6" />
          <pointLight position={[3, 1, -2]} intensity={30} color="#60a5fa" />
          {summoned && <Crystal t={summoned.springs.t} reduced={reduced} />}
          <mesh rotation-x={-Math.PI / 2}>
            <planeGeometry args={[30, 30]} />
            <MeshReflectorMaterial
              resolution={512}
              blur={[300, 100]}
              mixBlur={1}
              mixStrength={40}
              roughness={1}
              depthScale={1.2}
              minDepthThreshold={0.4}
              maxDepthThreshold={1.4}
              color="#0c0a14"
              metalness={0.5}
              mirror={0}
            />
          </mesh>
        </Canvas>
      </div>

      {summoned && (
        <animated.div
          className={styles.caption}
          style={{
            opacity: summoned.springs.t,
            transform: summoned.springs.t.to(
              v => `translate3d(-50%, ${reduced ? 0 : (1 - v) * 32}px, 0)`
            ),
          }}
        >
          <h2>Summoned</h2>
          <p>
            One spring moves the crystal, its light and this card. Toggle
            mid-flight and it turns around.
          </p>
          <code>phase: {summoned.phase}</code>
        </animated.div>
      )}

      <button className={styles.button} onClick={toggle} aria-pressed={open}>
        {open ? 'Dismiss' : 'Summon'}
        <kbd>Space</kbd>
      </button>
    </div>
  )
}
