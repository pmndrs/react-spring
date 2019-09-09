import { assert, _ } from 'spec.ts'
import { SpringValue } from './SpringValue'
import { to } from './interpolate'
import { To } from './To'

jest.mock('./interpolate')

function spring<T>(value: T): SpringValue<T> {
  return new SpringValue('').update({ from: { value } }) as any
}

describe('AnimatedValue interpolation options', () => {
  it('accepts an AnimatedValue and a range shortcut config', () => {
    const value = to(spring(1), [0, 1, 2], [4, 5, 6])
    expect(value.get()).toBe(5)
  })

  it('accepts a config object with extrapolate extend', () => {
    const value = to(spring(2), {
      range: [0, 1],
      output: [10, 20],
      extrapolate: 'extend',
    })
    expect(value.get()).toBe(30)
  })

  it('accepts a config object with extrapolate clamp', () => {
    const value = to(spring(100), {
      range: [0, 1],
      output: [10, 20],
      extrapolate: 'clamp',
    })
    expect(value.get()).toBe(20)
  })

  it('accepts a config object with extrapolate identity', () => {
    const value = to(spring(100), {
      output: [10, 20],
      extrapolate: 'identity',
    })
    expect(value.get()).toBe(100)
  })

  it('accepts an AnimatedValueArray and a range shortcut config', () => {
    const value = to(spring([1, 2]), [1, 2], [4, 5])
    expect(value.get()).toBe(4)
  })

  it('accepts multiple AnimatedValues and a range shortcut config', () => {
    const value = to(
      [spring(2), spring(4)],
      [0, 2, 4, 6, 8],
      [10, 20, 30, 40, 50]
    )
    assert(value, _ as To<number>)
    expect(value.get()).toBe(20)
  })

  it('accepts multiple AnimatedValues and an interpolation function', () => {
    const value = to([spring(5), spring('text')] as const, (a, b) => {
      assert(a, _ as number)
      assert(b, _ as string)
      return `t(${a}, ${b})`
    })
    assert(value, _ as To<string>)
    expect(value.get()).toBe('t(5, text)')
  })

  it('accepts an AnimatedValueArray and an interpolation function', () => {
    const value = to(spring([1, 2, 3]), (r, g, b) => `rgb(${r}, ${g}, ${b})`)
    expect(value.get()).toBe('rgb(1, 2, 3)')
  })

  it('chains interpolations', () => {
    const value = to(spring(1), [0, 1], [1, 2])
      .to(x => x * 2)
      .to([3, 4], [30, 40])
      .to(x => x / 2)
    expect(value.get()).toBe(20)
  })
})
