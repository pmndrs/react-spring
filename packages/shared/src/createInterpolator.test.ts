import { createInterpolator, Globals } from '.'
import { createStringInterpolator } from './stringInterpolation'
import { colors } from './colors'

beforeAll(() => {
  Globals.assign({
    createStringInterpolator,
    colors,
  })
})

describe('Interpolation', () => {
  it('should work with defaults', () => {
    const interpolation = createInterpolator({
      range: [0, 1],
      output: [0, 1],
    })

    expect(interpolation(0)).toBe(0)
    expect(interpolation(0.5)).toBe(0.5)
    expect(interpolation(0.8)).toBe(0.8)
    expect(interpolation(1)).toBe(1)
  })

  it('should work with interpolation function as argument', () => {
    const interpolation = createInterpolator(
      (value: number) => `scale(${value})`
    )

    expect(interpolation(0)).toBe('scale(0)')
    expect(interpolation(10.5)).toBe('scale(10.5)')
  })

  it('should work with range arrays as arguments', () => {
    const interpolation = createInterpolator([0, 1], [100, 200])

    expect(interpolation(0)).toBe(100)
    expect(interpolation(0.5)).toBe(150)
    expect(interpolation(0.8)).toBe(180)
    expect(interpolation(1)).toBe(200)
  })

  it('should work with output range', () => {
    const interpolation = createInterpolator({
      range: [0, 1],
      output: [100, 200],
    })

    expect(interpolation(0)).toBe(100)
    expect(interpolation(0.5)).toBe(150)
    expect(interpolation(0.8)).toBe(180)
    expect(interpolation(1)).toBe(200)
  })

  it('should work with input range', () => {
    const interpolation = createInterpolator({
      range: [100, 200],
      output: [0, 1],
    })

    expect(interpolation(100)).toBe(0)
    expect(interpolation(150)).toBe(0.5)
    expect(interpolation(180)).toBe(0.8)
    expect(interpolation(200)).toBe(1)
  })

  it('should work with keyframes without extrapolate', () => {
    const interpolation = createInterpolator({
      range: [0, 1, 2],
      output: [0.2, 1, 0.2],
      extrapolate: 'clamp',
    })

    expect(interpolation(5)).toBeCloseTo(0.2)
  })

  it('should work with output ranges as string', () => {
    const interpolation = createInterpolator({
      range: [0, 1],
      output: ['rgba(0, 100, 200, 0)', 'rgba(50, 150, 250, 0.4)'],
    })

    expect(interpolation(0)).toBe('rgba(0, 100, 200, 0)')
    expect(interpolation(0.5)).toBe('rgba(25, 125, 225, 0.2)')
    expect(interpolation(1)).toBe('rgba(50, 150, 250, 0.4)')
  })

  it('should work with output ranges as short hex string', () => {
    const interpolation = createInterpolator({
      range: [0, 1],
      output: ['#024', '#9BF'],
    })

    expect(interpolation(0)).toBe('rgba(0, 34, 68, 1)')
    expect(interpolation(0.5)).toBe('rgba(77, 111, 162, 1)')
    expect(interpolation(1)).toBe('rgba(153, 187, 255, 1)')
  })

  it('should work with output ranges as long hex string', () => {
    const interpolation = createInterpolator({
      range: [0, 1],
      output: ['#FF9500', '#87FC70'],
    })

    expect(interpolation(0)).toBe('rgba(255, 149, 0, 1)')
    expect(interpolation(0.5)).toBe('rgba(195, 201, 56, 1)')
    expect(interpolation(1)).toBe('rgba(135, 252, 112, 1)')
  })

  it('should work with output ranges with mixed hex and rgba strings', () => {
    const interpolation = createInterpolator({
      range: [0, 1],
      output: ['rgba(100, 120, 140, 0.4)', '#87FC70'],
    })

    expect(interpolation(0)).toBe('rgba(100, 120, 140, 0.4)')
    expect(interpolation(0.5)).toBe('rgba(118, 186, 126, 0.7)')
    expect(interpolation(1)).toBe('rgba(135, 252, 112, 1)')
  })

  it('should work with negative and decimal values in string ranges', () => {
    const interpolation = createInterpolator({
      range: [0, 1],
      output: ['-100.5deg', '100deg'],
    })

    expect(interpolation(0)).toBe('-100.5deg')
    expect(interpolation(0.5)).toBe('-0.25deg')
    expect(interpolation(1)).toBe('100deg')
  })

  it('should interpolate between number and unit', () => {
    const interpolation = createInterpolator({
      range: [0, 1],
      output: ['0', '100%'],
    })

    expect(interpolation(0.5)).toBe('50%')
  })

  it('should support a mix of color patterns', () => {
    const interpolation = createInterpolator({
      range: [0, 1, 2],
      output: ['rgba(0, 100, 200, 0)', 'rgb(50, 150, 250)', 'red'],
    })

    expect(interpolation(0)).toBe('rgba(0, 100, 200, 0)')
    expect(interpolation(0.5)).toBe('rgba(25, 125, 225, 0.5)')
    expect(interpolation(1.5)).toBe('rgba(153, 75, 125, 1)')
    expect(interpolation(2)).toBe('rgba(255, 0, 0, 1)')
  })

  it('should round rgb values', () => {
    const interpolation = createInterpolator({
      range: [0, 1],
      output: ['rgba(0, 0, 0, 0)', 'rgba(3, 3, 3, 1)'],
    })

    expect(interpolation(0.5)).toBe('rgba(2, 2, 2, 0.5)')
  })

  it('should not match partial color names', () => {
    const interpolation = createInterpolator({
      range: [0, 1],
      output: ['grayscale(0%)', 'grayscale(100%)'],
    })

    expect(interpolation(0.5)).toBe('grayscale(50%)')
  })

  describe('CSS Variables', () => {
    const originalGetComputedStyle = window.getComputedStyle

    const getComputedStyleMock = () => ({
      getPropertyValue: (variableName: '--from' | '--to' | '--no') => {
        switch (variableName) {
          case '--from':
            return '#3cffd0'
          case '--to':
            return '#277ef4'
          case '--no':
            return undefined
          default:
            throw Error('Should never happen')
        }
      },
    })

    beforeAll(() => {
      // @ts-expect-error for testing purposes only.
      window.getComputedStyle = getComputedStyleMock
    })
    afterAll(() => {
      window.getComputedStyle = originalGetComputedStyle
    })

    it('should correctly parse variables', () => {
      const interpolation = createInterpolator({
        range: [0, 1],
        output: ['var(--to)', 'var(--from)'],
      })

      expect(interpolation(0.0)).toBe('rgba(39, 126, 244, 1)')
      expect(interpolation(0.5)).toBe('rgba(50, 191, 226, 1)')
      expect(interpolation(1.0)).toBe('rgba(60, 255, 208, 1)')
    })

    it('should return the fallbacks if the variable cannot be found', () => {
      const interpolation = createInterpolator({
        range: [0, 1],
        output: ['var(--no, pink)', 'var(--no, purple)'],
      })

      expect(interpolation(0.0)).toBe('rgba(255, 192, 203, 1)')
      expect(interpolation(0.5)).toBe('rgba(192, 96, 166, 1)')
      expect(interpolation(1.0)).toBe('rgba(128, 0, 128, 1)')
    })

    it('should correctly parse the fallback if its a variable', () => {
      let interpolation = createInterpolator({
        range: [0, 1],
        output: ['var(--no, --to)', 'var(--no, --from)'],
      })

      expect(interpolation(0.0)).toBe('rgba(39, 126, 244, 1)')
      expect(interpolation(0.5)).toBe('rgba(50, 191, 226, 1)')
      expect(interpolation(1.0)).toBe('rgba(60, 255, 208, 1)')

      interpolation = createInterpolator({
        range: [0, 1],
        output: ['var(--no, var(--to))', 'var(--no, var(--from))'],
      })

      expect(interpolation(0.0)).toBe('rgba(39, 126, 244, 1)')
      expect(interpolation(0.5)).toBe('rgba(50, 191, 226, 1)')
      expect(interpolation(1.0)).toBe('rgba(60, 255, 208, 1)')

      interpolation = createInterpolator({
        range: [0, 1],
        output: ['var(--no, var(--no, pink))', 'var(--no, var(--no, purple))'],
      })

      expect(interpolation(0.0)).toBe('rgba(255, 192, 203, 1)')
      expect(interpolation(0.5)).toBe('rgba(192, 96, 166, 1)')
      expect(interpolation(1.0)).toBe('rgba(128, 0, 128, 1)')
    })
  })
})
