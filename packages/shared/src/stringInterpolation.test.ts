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
