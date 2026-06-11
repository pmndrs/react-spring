import { Controller } from './Controller'
import { SpringRef } from './SpringRef'

// `useSpring`/`useTransition` already guard the React-side wiring of an injected
// ref (deferral, event firing, StrictMode double-mount). These tests exercise
// the imperative `SpringRef` API itself, which had no dedicated coverage.
describe('SpringRef', () => {
  it('adds and removes controllers, ignoring duplicates', () => {
    const ref = SpringRef()
    const a = new Controller({ x: 0 })
    const b = new Controller({ x: 0 })

    ref.add(a)
    ref.add(b)
    ref.add(a) // duplicate is ignored
    expect(ref.current).toEqual([a, b])

    ref.delete(a)
    expect(ref.current).toEqual([b])
  })

  it('starts every controller with shared props', async () => {
    const ref = SpringRef()
    const a = new Controller({ x: 0 })
    const b = new Controller({ x: 0 })
    ref.add(a)
    ref.add(b)

    ref.start({ x: 100 })
    await global.advanceUntilIdle()

    expect(a.springs.x.get()).toBe(100)
    expect(b.springs.x.get()).toBe(100)
  })

  it('passes the index to a start function for per-controller props', async () => {
    const ref = SpringRef()
    const a = new Controller({ x: 0 })
    const b = new Controller({ x: 0 })
    ref.add(a)
    ref.add(b)

    ref.start(i => ({ x: (i + 1) * 100 }))
    await global.advanceUntilIdle()

    expect(a.springs.x.get()).toBe(100)
    expect(b.springs.x.get()).toBe(200)
  })

  it('set() updates values instantly without animating', () => {
    const ref = SpringRef()
    const a = new Controller({ x: 0 })
    ref.add(a)

    ref.set({ x: 50 })
    // No frames advanced — set is synchronous.
    expect(a.springs.x.get()).toBe(50)
  })

  it('set() accepts a function for per-controller values', () => {
    const ref = SpringRef()
    const a = new Controller({ x: 0 })
    const b = new Controller({ x: 0 })
    ref.add(a)
    ref.add(b)

    ref.set((i: number) => ({ x: i * 10 }))
    expect(a.springs.x.get()).toBe(0)
    expect(b.springs.x.get()).toBe(10)
  })

  it('stop() halts an in-flight animation where it is', async () => {
    const ref = SpringRef()
    const a = new Controller({ x: 0 })
    ref.add(a)

    ref.start({ x: 100 })
    await global.advance(3)
    ref.stop()

    const stopped = a.springs.x.get()
    expect(stopped).toBeGreaterThan(0)
    expect(stopped).toBeLessThan(100)
    expect(a.springs.x.idle).toBe(true)

    // It must not creep towards the goal after being stopped.
    await global.advance(20)
    expect(a.springs.x.get()).toBe(stopped)
  })

  it('pause() freezes an animation and resume() continues it', async () => {
    const ref = SpringRef()
    const a = new Controller({ x: 0 })
    ref.add(a)

    ref.start({ x: 100 })
    await global.advance(3)
    ref.pause()

    const paused = a.springs.x.get()
    await global.advance(20)
    expect(a.springs.x.get()).toBe(paused) // frozen while paused

    ref.resume()
    await global.advanceUntilIdle()
    expect(a.springs.x.get()).toBe(100) // resumes to completion
  })

  it('update() only queues props; they run on the next start()', async () => {
    const ref = SpringRef()
    const a = new Controller({ x: 0 })
    ref.add(a)

    ref.update({ x: 100 })
    await global.advance(10)
    expect(a.springs.x.get()).toBe(0) // queued, not started

    ref.start()
    await global.advanceUntilIdle()
    expect(a.springs.x.get()).toBe(100)
  })

  it('pause(key) only pauses the matching spring', async () => {
    const ref = SpringRef()
    const a = new Controller({ x: 0, y: 0 })
    ref.add(a)

    ref.start({ x: 100, y: 100 })
    await global.advance(3)
    ref.pause('x')

    const pausedX = a.springs.x.get()
    await global.advanceUntilIdle()

    expect(a.springs.x.get()).toBe(pausedX) // x stayed paused
    expect(a.springs.y.get()).toBe(100) // y ran to completion
  })
})
