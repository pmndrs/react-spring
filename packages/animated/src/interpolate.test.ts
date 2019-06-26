import { AnimatedValue, AnimatedArray, interpolate } from '.'
import { SpringValue } from 'shared'
import { assert, _ } from 'spec.ts'

describe('AnimatedValue interpolation options', () => {
  it('accepts an AnimatedValue and a range shortcut config', () => {
    const value = interpolate(new AnimatedValue(1), [0, 1, 2], [4, 5, 6])
    expect(value.getValue()).toBe(5)
  })

  it('accepts a config object with extrapolate extend', () => {
    const value = interpolate(new AnimatedValue(2), {
      range: [0, 1],
      output: [10, 20],
      extrapolate: 'extend',
    })
    expect(value.getValue()).toBe(30)
  })

  it('accepts a config object with extrapolate clamp', () => {
    const value = interpolate(new AnimatedValue(100), {
      range: [0, 1],
      output: [10, 20],
      extrapolate: 'clamp',
    })
    expect(value.getValue()).toBe(20)
  })

  it('accepts a config object with extrapolate identity', () => {
    const value = interpolate(new AnimatedValue(100), {
      output: [10, 20],
      extrapolate: 'identity',
    })
    expect(value.getValue()).toBe(100)
  })

  function createAnimatedArray(values: readonly number[]) {
    return new AnimatedArray(values.map(value => new AnimatedValue(value)))
  }

  it('accepts an AnimatedValueArray and a range shortcut config', () => {
    const value = interpolate(createAnimatedArray([1, 2]), [1, 2], [4, 5])
    expect(value.getValue()).toBe(4)
  })

  it('accepts multiple AnimatedValues and a range shortcut config', () => {
    const value = interpolate(
      [new AnimatedValue(2), new AnimatedValue(4)],
      [0, 2, 4, 6, 8],
      [10, 20, 30, 40, 50]
    )
    assert(value, _ as SpringValue<number>)
    expect(value.getValue()).toBe(20)
  })

  it('accepts multiple AnimatedValues and an interpolation function', () => {
    const value = interpolate(
      [new AnimatedValue(5), new AnimatedValue('text')] as const,
      (a, b) => {
        assert(a, _ as number)
        assert(b, _ as string)
        return `t(${a}, ${b})`
      }
    )
    assert(value, _ as SpringValue<string>)
    expect(value.getValue()).toBe('t(5, text)')
  })

  it('accepts an AnimatedValueArray and an interpolation function', () => {
    const value = interpolate(
      createAnimatedArray([1, 2, 3]),
      (r, g, b) => `rgb(${r}, ${g}, ${b})`
    )
    expect(value.getValue()).toBe('rgb(1, 2, 3)')
  })

  it('chains interpolations', () => {
    const value = interpolate(
      new AnimatedValue(1) as SpringValue<number>,
      [0, 1],
      [1, 2]
    )
      .interpolate(x => x * 2)
      .interpolate([3, 4], [30, 40])
      .interpolate(x => x / 2)
    expect(value.getValue()).toBe(20)
  })
})
