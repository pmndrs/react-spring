import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createElement, createRef, type ReactNode } from 'react'
import { render } from 'vitest-browser-react'
import { Mesh } from 'three'
import {
  act,
  advance,
  createRoot,
  extend,
  invalidate,
  unmountComponentAtNode,
  type RootState,
} from '@react-three/fiber'
import * as core from '@react-spring/core'
import * as three from '@react-spring/three'
import {
  Globals,
  SpringValue as WebSpringValue,
  animated as webAnimated,
} from '@react-spring/web'

// r3f's `act` only flushes when React knows it is running under a test.
;(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true

// `createRoot`, unlike `<Canvas>`, doesn't register three's classes.
extend({ Mesh })

// These specs run on the real browser clock and r3f's real loop, so they
// replace the mock clock and rAF that the shared setup installs. Frames the
// default clock books are counted so a spec can wait for its loop to run out.
let bookedFrames = 0
const browserRaf = (cb: FrameRequestCallback) => {
  bookedFrames++
  window.requestAnimationFrame(time => {
    bookedFrames--
    cb(time)
  })
}

const nextFrames = async (count: number) => {
  for (let i = 0; i < count; i++) {
    await new Promise(resolve => requestAnimationFrame(resolve))
  }
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const roots: { canvas: HTMLCanvasElement; unmount: () => Promise<unknown> }[] =
  []
const mountCanvas = async (
  frameloop: RootState['frameloop'],
  content: ReactNode = null
) => {
  const canvas = document.createElement('canvas')
  document.body.appendChild(canvas)
  let gl!: RootState['gl']
  const root = createRoot(canvas)
  await root.configure({
    frameloop,
    onCreated: state => {
      gl = state.gl
    },
  })
  await act(async () => root.render(content))
  await nextFrames(1)

  let tornDown: Promise<unknown> | undefined
  const handle = {
    canvas,
    // Resolves once r3f has torn the root down and forgotten it.
    unmount: () =>
      (tornDown ??= new Promise(resolve =>
        unmountComponentAtNode(canvas, resolve)
      )),
  }
  roots.push(handle)
  return { root: handle, gl }
}

const rendersDuring = async (gl: RootState['gl'], frames: number) => {
  const before = gl.info.render.frame
  await nextFrames(frames)
  return gl.info.render.frame - before
}

// Records the browser frame of every tick, including ticks where no time has
// passed and the value doesn't change. Two ticks in one frame integrate time
// that never passed (physics springs run fast, duration springs get a NaN
// velocity when dt is 0).
let tickFrames = new Map<unknown, unknown[]>()

// The shared setup only clears the default clock, so springs left running on
// r3f's clock would keep the next spec's Canvas awake.
const running: { stop(): unknown }[] = []
const track = <T extends { stop(): unknown }>(value: T) => {
  running.push(value)
  return value
}

const startSpring = (Spring: typeof WebSpringValue) => {
  const spring = track(new Spring(0))
  const ticks: unknown[] = []
  tickFrames.set(spring, ticks)
  const done = spring.start(1)
  return { spring, done, ticks }
}

const expectAnimatingOncePerFrame = async (
  subject: ReturnType<typeof startSpring>,
  frames = 10
) => {
  const valueBefore = subject.spring.get()
  const ticksBefore = subject.ticks.length
  await nextFrames(frames)
  const framesTicked = subject.ticks.slice(ticksBefore)

  expect(subject.spring.get()).toBeGreaterThan(valueBefore)
  expect(framesTicked.length).toBeGreaterThanOrEqual(frames - 1)
  expect(framesTicked.length).toBe(new Set(framesTicked).size)
}

beforeEach(() => {
  vi.useRealTimers()
  tickFrames = new Map()
  Globals.assign({
    now: () => performance.now(),
    requestAnimationFrame: browserRaf,
    willAdvance: animation =>
      tickFrames.get(animation)?.push(document.timeline.currentTime),
  })
})

// Wait for r3f to forget every root, so no spec sees the previous spec's.
afterEach(async () => {
  running.splice(0).forEach(value => value.stop())
  const unmounting = roots.splice(0)
  await Promise.all(unmounting.map(root => root.unmount()))
  unmounting.forEach(root => root.canvas.remove())

  // Let the default clock's loop run out. The shared setup resets that clock
  // before the next spec, and a frame still booked on the real rAF would then
  // run beside the new loop.
  for (let i = 0; bookedFrames > 0 && i < 30; i++) await nextFrames(1)
  expect(bookedFrames).toBe(0)
})

describe('with @react-spring/three imported', () => {
  describe('web springs', () => {
    it('animate when no Canvas has been mounted (#1586)', async () => {
      const subject = startSpring(WebSpringValue)
      await nextFrames(2)

      await expectAnimatingOncePerFrame(subject)
    })

    it.each(['always', 'demand'] as const)(
      'keep animating after the only frameloop="%s" Canvas unmounts (#1586)',
      async frameloop => {
        const { root } = await mountCanvas(frameloop)
        const subject = startSpring(WebSpringValue)
        await nextFrames(3)

        void root.unmount()
        // r3f still runs the frames it booked before tearing the root down
        // (two with frameloop="demand" in r3f 9.8).
        await nextFrames(5)

        await expectAnimatingOncePerFrame(subject)
      }
    )

    it.each(['always', 'demand'] as const)(
      'animate once per frame while a frameloop="%s" Canvas is mounted',
      async frameloop => {
        await mountCanvas(frameloop)
        const subject = startSpring(WebSpringValue)
        await nextFrames(2)

        await expectAnimatingOncePerFrame(subject)
      }
    )

    it('keep animating once per frame when a Canvas mounts mid-animation', async () => {
      const subject = startSpring(WebSpringValue)
      await nextFrames(2)
      expect(subject.spring.get()).toBeGreaterThan(0)

      await mountCanvas('always')

      await expectAnimatingOncePerFrame(subject)
    })

    it('keep following the browser while every Canvas is frameloop="never"', async () => {
      await mountCanvas('never')
      const subject = startSpring(WebSpringValue)
      await nextFrames(2)

      await expectAnimatingOncePerFrame(subject)
    })

    // rafz asks the host for one more frame after each write; without that,
    // r3f stops between the web spring's writes and renders every other frame.
    it('drive an animated.mesh in a frameloop="demand" Canvas on every frame', async () => {
      const { spring } = startSpring(WebSpringValue)
      const mesh = createRef<Mesh>()
      const { gl } = await mountCanvas(
        'demand',
        createElement(three.animated.mesh, { ref: mesh, scale: spring })
      )

      expect(await rendersDuring(gl, 10)).toBeGreaterThanOrEqual(9)
      expect(mesh.current!.scale.x).toBeGreaterThan(0)
    })
  })

  describe('three springs', () => {
    it.each(['always', 'demand'] as const)(
      'animate once per frame in a frameloop="%s" Canvas',
      async frameloop => {
        await mountCanvas(frameloop)
        const subject = startSpring(three.SpringValue)
        await nextFrames(2)

        await expectAnimatingOncePerFrame(subject)
      }
    )

    it('render a frameloop="demand" Canvas on every frame while animating a mesh, then let it sleep', async () => {
      const { spring, done } = startSpring(three.SpringValue)
      const mesh = createRef<Mesh>()
      const { gl } = await mountCanvas(
        'demand',
        createElement(three.animated.mesh, { ref: mesh, scale: spring })
      )

      expect(await rendersDuring(gl, 10)).toBeGreaterThanOrEqual(9)
      // Written in the same tick it was computed, before r3f renders.
      expect(mesh.current!.scale.x).toBe(spring.get())

      await done
      expect(await rendersDuring(gl, 10)).toBeLessThanOrEqual(2)
    })

    it('drive a @react-spring/web animated element while a Canvas runs', async () => {
      await mountCanvas('always')
      const { spring } = startSpring(three.SpringValue)
      const { container } = await render(
        createElement(webAnimated.div, { style: { opacity: spring } })
      )

      await nextFrames(10)

      const element = container.firstElementChild as HTMLElement
      expect(Number(element.style.opacity)).toBeGreaterThan(0)
    })

    it('start after a delay in an idle frameloop="demand" Canvas', async () => {
      await mountCanvas('demand')
      await nextFrames(5)

      const spring = track(new three.SpringValue(0))
      spring.start(1, { delay: 100, config: { duration: 200 } })
      await nextFrames(20)

      expect(spring.get()).toBeGreaterThan(0)
    })

    it('advance only when the user calls advance() while every Canvas is frameloop="never"', async () => {
      await mountCanvas('never')
      const { spring } = startSpring(three.SpringValue)
      const ctrl = track(new three.Controller({ x: 0 }))
      ctrl.start({ x: 1 })

      await nextFrames(5)
      const beforeUserAdvance = [spring.get(), ctrl.get().x]
      for (let i = 0; i < 3; i++) {
        await nextFrames(1)
        advance(performance.now())
      }

      expect(beforeUserAdvance).toEqual([0, 0])
      expect(spring.get()).toBeGreaterThan(0)
      expect(ctrl.get().x).toBeGreaterThan(0)
    })

    it('from hooks advance only when the user calls advance() while every Canvas is frameloop="never"', async () => {
      let x!: core.SpringValue<number>
      const Box = () => {
        ;({ x } = three.useSpring({ from: { x: 0 }, to: { x: 1 } }))
        return null
      }
      await mountCanvas('never', createElement(Box))

      await nextFrames(5)
      const beforeUserAdvance = x.get()
      for (let i = 0; i < 3; i++) {
        await nextFrames(1)
        advance(performance.now())
      }

      expect(beforeUserAdvance).toBe(0)
      expect(x.get()).toBeGreaterThan(0)
    })

    it('pause while no Canvas is running', async () => {
      const { spring } = startSpring(three.SpringValue)

      await nextFrames(5)

      expect(spring.get()).toBe(0)
    })

    it('move a mesh from XR frames while the browser holds its frames, then tick once per frame after the session ends (#1518)', async () => {
      // Hold the default clock's rAF, as a headset pauses the page's frames. A
      // spring or write that leaked onto it would freeze the mesh. r3f stops its
      // own loop while presenting, so XR frames arrive only through `advance`.
      const heldFrames: FrameRequestCallback[] = []
      Globals.assign({ requestAnimationFrame: cb => heldFrames.push(cb) })
      const spring = track(new three.SpringValue(0))
      const mesh = createRef<Mesh>()
      const { gl } = await mountCanvas(
        'always',
        createElement(three.animated.mesh, { ref: mesh, scale: spring })
      )
      gl.xr.isPresenting = true

      for (const goal of [1, 0, 1]) {
        let settled = false
        void spring
          .start(goal, { config: { duration: 50 } })
          .then(() => (settled = true))
        for (let frame = 0; frame < 30 && !settled; frame++) {
          await wait(16)
          advance(performance.now())
        }
        expect(settled).toBe(true)
        expect(mesh.current!.scale.x).toBe(goal)
      }

      gl.xr.isPresenting = false
      Globals.assign({ requestAnimationFrame: browserRaf })
      heldFrames.splice(0).forEach(browserRaf)
      invalidate()

      await expectAnimatingOncePerFrame(startSpring(three.SpringValue))
    })
  })

  it('treats springs and controllers made by hooks as instances of its classes', () => {
    // Hooks create core instances; `instanceof` has always matched them.
    expect(new core.SpringValue(0) instanceof three.SpringValue).toBe(true)
    expect(new core.Controller() instanceof three.Controller).toBe(true)

    // A subclass keeps the normal check.
    class MySpring extends three.SpringValue {}
    expect(new core.SpringValue(0) instanceof MySpring).toBe(false)
    expect(new MySpring(0) instanceof MySpring).toBe(true)
  })

  it("runs every hook, component and class that creates springs on r3f's clock", () => {
    // These create no springs of their own, or take their source's clock.
    const createsNoSprings = [
      'Any',
      'BailSignal',
      'FrameValue',
      'Globals',
      'Interpolation',
      'SpringContext',
      'SpringRef',
      'useChain',
      'useIsomorphicLayoutEffect',
      'useReducedMotion',
      'useSpringRef',
    ]

    const unbound = Object.keys(core).filter(
      name =>
        /^(use)?[A-Z]/.test(name) &&
        !createsNoSprings.includes(name) &&
        three[name as keyof typeof three] === core[name as keyof typeof core]
    )

    expect(unbound).toEqual([])
  })
})
