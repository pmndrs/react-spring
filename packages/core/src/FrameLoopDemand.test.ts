import { describe, it, beforeEach, afterEach, expect } from 'vitest'
import { raf } from '@react-spring/rafz'
import { flushMicroTasks } from 'flush-microtasks'

import { Globals, Controller } from './index'

/**
 * Regression for #2402 — looping animations freeze under r3f's
 * `frameloop="demand"`.
 *
 * Correct expectation (the bar this test sets): a *bare* demand host must
 * animate a `loop: true` sequence with **no** user-side workarounds — no
 * `invalidate()` in `onChange`/`onStart`/`onRest`, no `useFrame` `isAnimating`
 * guard. react-spring must drive the host itself.
 *
 * The fix: rafz already knows whether it has a queue. It signals that through
 * `Globals.onDemand`; `@react-spring/three` turns the signal into an
 * `invalidate()` *deferred to after the current frame*. The deferral matters —
 * `@react-spring/three` ticks rafz from r3f's `addEffect`, which runs in r3f's
 * *before* phase, where `invalidate()` only SETS `frames = 1` and the same
 * tick's `update()` decrements it back to `0` (cancelling the next frame). A
 * deferred `invalidate()` instead lands once the loop has stopped, cleanly
 * restarting it.
 *
 * `DemandHost` faithfully models r3f v9's loop plus that deferred-invalidate
 * glue. It registers no `useFrame` subscriber, so the only thing that can keep
 * the loop alive is react-spring driving it via `onDemand`.
 */
class DemandHost {
  private frames = 0
  running = false

  /** r3f's invalidate(): request a frame and wake a sleeping loop. */
  invalidate = () => {
    this.frames = Math.max(this.frames, 1)
    this.running = true
  }

  /**
   * The three target's glue: on rafz's "pending work" signal, request a frame
   * deferred past the current frame so r3f's same-frame decrement can't eat it.
   */
  onDemand = () => {
    Promise.resolve().then(this.invalidate)
  }

  async drive({ cap, until }: { cap: number; until: () => boolean }) {
    let ticks = 0
    while (this.running && ticks < cap) {
      globalThis.mockRaf.step() // advance the clock so each frame has dt > 0
      let repeat = 0

      // flushGlobalEffects('before') === the three target's addEffect; rafz
      // update() runs here and fires onDemand while it has a queue.
      raf.advance()

      if (this.frames > 0) {
        // update(): no useFrame subscribers; render, then decrement.
        this.frames = Math.max(0, this.frames - 1)
        repeat += this.frames
      }

      // Nothing kept the loop alive this frame → r3f stops it...
      if (repeat === 0) this.running = false

      await flushMicroTasks() // ...the deferred invalidate (and loop restarts) land here
      ticks++
      if (until()) break
    }
    return ticks
  }
}

describe('frameLoop "demand"', () => {
  beforeEach(() => {
    Globals.assign({ frameLoop: 'demand' })
  })
  afterEach(() => {
    raf.frameLoop = 'always'
    raf.onDemand = () => {}
  })

  it('drives a looping to-array with no user workarounds (regression for #2402)', async () => {
    const ctrl = new Controller<{ pos: number }>({ pos: 0 })
    const host = new DemandHost()

    // The proposed seam: rafz signals pending demand-mode work, the target
    // turns it into a deferred frame request. No-op today, so the loop freezes.
    Globals.assign({ onDemand: host.onDemand })

    // Measurement only — counts segment starts; never requests a frame.
    let starts = 0
    ctrl.start({
      to: [{ pos: 1 }, { pos: 0 }],
      loop: true,
      config: { duration: 100 },
      onStart: () => starts++,
    })

    // r3f renders one frame on mount; after that react-spring is on its own.
    host.invalidate()

    await host.drive({ cap: 1000, until: () => starts >= 3 })

    // A `loop: true` animation must keep cycling through its segments. With the
    // bug the loop dies once the host stops being told to render, so only the
    // first segment ever starts.
    expect(starts).toBeGreaterThanOrEqual(3)
  })
})
