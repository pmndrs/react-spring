import { SpringValue } from './SpringValue'
import { to } from './interpolate'
import { addFluidObserver } from '@react-spring/shared'

describe('Interpolation', () => {
  it.todo('can use a SpringValue')
  it.todo('can use another Interpolation')
  it.todo('can use a non-animated FluidValue')

  describe('when multiple inputs change in the same frame', () => {
    it.todo('only computes its value once')
  })

  describe('when an input resets its animation', () => {
    it.todo('computes its value before the first frame')
  })

  describe('when all inputs are paused', () => {
    it('leaves the frameloop', () => {
      const a = new SpringValue({ from: 0, to: 1 })
      const b = new SpringValue({ from: 1, to: 0 })
      global.mockRaf.step()

      const calc = jest.fn((a: number, b: number) => Math.abs(a - b))
      const c = to([a, b], calc)

      // For interpolation to be active, it must be observed.
      const observer = jest.fn()
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
