'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
var _1 = require('.')
var spec_ts_1 = require('spec.ts')
describe('AnimatedValue interpolation options', function() {
  it('accepts an AnimatedValue and a range shortcut config', function() {
    var value = _1.interpolate(new _1.AnimatedValue(1), [0, 1, 2], [4, 5, 6])
    expect(value.getValue()).toBe(5)
  })
  it('accepts a config object with extrapolate extend', function() {
    var value = _1.interpolate(new _1.AnimatedValue(2), {
      range: [0, 1],
      output: [10, 20],
      extrapolate: 'extend',
    })
    expect(value.getValue()).toBe(30)
  })
  it('accepts a config object with extrapolate clamp', function() {
    var value = _1.interpolate(new _1.AnimatedValue(100), {
      range: [0, 1],
      output: [10, 20],
      extrapolate: 'clamp',
    })
    expect(value.getValue()).toBe(20)
  })
  it('accepts a config object with extrapolate identity', function() {
    var value = _1.interpolate(new _1.AnimatedValue(100), {
      output: [10, 20],
      extrapolate: 'identity',
    })
    expect(value.getValue()).toBe(100)
  })
  function createAnimatedArray(values) {
    return new _1.AnimatedValueArray(
      values.map(function(value) {
        return new _1.AnimatedValue(value)
      })
    )
  }
  it('accepts an AnimatedValueArray and a range shortcut config', function() {
    var value = _1.interpolate(createAnimatedArray([1, 2]), [1, 2], [4, 5])
    expect(value.getValue()).toBe(4)
  })
  it('accepts multiple AnimatedValues and a range shortcut config', function() {
    var value = _1.interpolate(
      [new _1.AnimatedValue(2), new _1.AnimatedValue(4)],
      [0, 2, 4, 6, 8],
      [10, 20, 30, 40, 50]
    )
    spec_ts_1.assert(value, spec_ts_1._)
    expect(value.getValue()).toBe(20)
  })
  it('accepts multiple AnimatedValues and an interpolation function', function() {
    var value = _1.interpolate(
      [new _1.AnimatedValue(0), new _1.AnimatedValue(0)],
      function(a, b) {
        spec_ts_1.assert(a, spec_ts_1._)
        spec_ts_1.assert(b, spec_ts_1._)
        return 't(' + a + ', ' + b + ')'
      }
    )
    spec_ts_1.assert(value, spec_ts_1._)
    expect(value.getValue()).toBe('t(5, text)')
  })
  it('accepts an AnimatedValueArray and an interpolation function', function() {
    var value = _1.interpolate(createAnimatedArray([1, 2, 3]), function(
      r,
      g,
      b
    ) {
      return 'rgb(' + r + ', ' + g + ', ' + b + ')'
    })
    expect(value.getValue()).toBe('rgb(1, 2, 3)')
  })
  it('chains interpolations', function() {
    var value = _1
      .interpolate(new _1.AnimatedValue(1), [0, 1], [1, 2])
      .interpolate(function(x) {
        return x * 2
      })
      .interpolate([3, 4], [30, 40])
      .interpolate(function(x) {
        return x / 2
      })
    expect(value.getValue()).toBe(20)
  })
})
