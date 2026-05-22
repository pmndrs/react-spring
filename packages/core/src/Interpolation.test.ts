import { SpringValue } from './SpringValue'
import { to } from './interpolate'
import { FluidValue, addFluidObserver } from '@react-spring/shared'

describe('Interpolation', () => {
  it('can use a SpringValue', async () => {
    const source = new SpringValue({ from: 0, to: 10 })
    const interp = to(source, (n: number) => n * 2)
    addFluidObserver(interp, () => {})
    await global.advanceUntilIdle()
    expect(interp.get()).toBe(20)
  })

  it('can use another Interpolation', async () => {
    const source = new SpringValue({ from: 0, to: 10 })
    const inner = to(source, (n: number) => n * 2)
    const interp = to(inner, (n: number) => n + 1)
    addFluidObserver(interp, () => {})
    await global.advanceUntilIdle()
    expect(interp.get()).toBe(21)
  })

  it('can use a non-animated FluidValue', () => {
    class StaticFluid extends FluidValue<number> {
      constructor(value: number) {
        super(() => value)
      }
    }
    const source = new StaticFluid(5)
    const interp = to(source, (n: number) => n * 2)
    expect(interp.get()).toBe(10)
  })

  describe('when multiple inputs change in the same frame', () => {
    it('only computes its value once', async () => {
      const a = new SpringValue({ from: 0, to: 1 })
      const b = new SpringValue({ from: 0, to: 1 })
      const calc = vi.fn((x: number, y: number) => x + y)
      const interp = to([a, b], calc)
      addFluidObserver(interp, () => {})

      calc.mockClear()
      await global.advance(1)
      expect(calc).toBeCalledTimes(1)
    })
  })

  describe('when an input resets its animation', () => {
    it('computes its value before the first frame', async () => {
      const source = new SpringValue({ from: 0, to: 10 })
      const interp = to(source, (n: number) => n * 2)
      addFluidObserver(interp, () => {})
      await global.advanceUntilIdle()
      expect(interp.get()).toBe(20)

      // Reset the source: it jumps back to "from" (0). The interpolation
      // should reflect that immediately, without waiting for the next frame.
      source.start({ reset: true })
      expect(interp.get()).toBe(0)
    })
  })

  describe('when all inputs are paused', () => {
    it('leaves the frameloop', () => {
      const a = new SpringValue({ from: 0, to: 1 })
      const b = new SpringValue({ from: 1, to: 0 })
      global.mockRaf.step()

      const calc = vi.fn((a: number, b: number) => Math.abs(a - b))
      const c = to([a, b], calc)

      // For interpolation to be active, it must be observed.
      const observer = vi.fn()
      addFluidObserver(c, observer)

      // Pause the first input.
      a.pause()

      // Expect interpolation to continue.
      calc.mockClear()
      global.mockRaf.step()
      expect(calc).toBeCalled()

      // Pause the other input.
      b.pause()

      // In the next frame, the interpolation still calculates its next value.
      // When its value stays the same, it checks the idle status of each input,
      // which triggers an update to its own idle status.
      calc.mockClear()
      global.mockRaf.step()
      expect(calc).toBeCalled()
      expect(c.idle).toBeTruthy()

      // Expect interpolation to be paused.
      calc.mockClear()
      global.mockRaf.step()
      expect(calc).not.toBeCalled()
    })
  })
})
