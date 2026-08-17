import { createStringInterpolator } from './stringInterpolation'
import { colors } from './colors'
import { Globals } from '.'

beforeAll(() => {
  Globals.assign({ createStringInterpolator, colors })
})

// https://github.com/pmndrs/react-spring/issues/2327
it('interpolates a number-less output value instead of throwing on a null match', () => {
  const interpolate = createStringInterpolator({
    range: [0, 1],
    output: ['none', '0px 4px 8px rgba(0, 0, 0, 0.5)'],
  })

  expect(interpolate(0)).toBe('none')
  expect(interpolate(0.5)).toBe('none')
})

// https://github.com/pmndrs/react-spring/issues/2397
// lab() values like `lab(77.96% -.0000298023 0)` contain decimals with no
// integer part and a leading minus. The old number regex split these into
// multiple tokens (`0`, `0`, `0`, `0`, `298023`) which broke arity
// checks against other keyframes.
it('interpolates colors containing negative decimals without an integer part', () => {
  const interpolate = createStringInterpolator({
    range: [0, 1],
    output: ['lab(77.96% -.0000298023 0)', 'oklch(0.4 0.2639 271.35 / 1)'],
  })

  expect(() => interpolate(0.5)).not.toThrow()
  expect(interpolate(1)).toBe('oklch(0.4 0.2639 271.35 / 1)')
})

it('parses a standalone negative decimal without an integer part', () => {
  const interpolate = createStringInterpolator({
    range: [0, 1],
    output: ['translateY(-.5px)', 'translateY(10px)'],
  })

  expect(() => interpolate(0.5)).not.toThrow()
  expect(interpolate(1)).toBe('translateY(10px)')
})
