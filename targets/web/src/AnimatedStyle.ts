import { SpringValue, each, is } from 'shared'

import {
  AnimatedObject,
  Animated,
  AnimatedArray,
  AnimatedValue,
  isAnimated,
  to,
  interpolate,
} from '@react-spring/animated'

/** The transform-functions
 * (https://developer.mozilla.org/fr/docs/Web/CSS/transform-function)
 * that you can pass as keys to your animated component style and that will be
 * animated. Perspective has been left out as it would conflict with the
 * non-transform perspective style.
 */
const domTransforms = [
  'transform',
  'matrix',
  'translate',
  'scale',
  'rotate',
  'skew',
]

// x, y, z and translate will get 'px' as unit default
const pxDefaults = ['x', 'y', 'z', 'translate']
// rotate and skew will get 'deg' as unit default
const dgDefaults = ['rotate', 'skew']

// adds a unit to the value when the value is unit-less (ie a number)
const mergeUnit = (value: number | string, unit: string): string | 0 =>
  is.num(value) && value !== 0 ? value + unit : value

// gets the default unit for a key
const getUnit = (key: string) =>
  pxDefaults.some(name => key.startsWith(name))
    ? 'px'
    : dgDefaults.some(name => key.startsWith(name))
    ? 'deg'
    : ''

type Value = number | string
type StyleValue = Value | Value[]
type AnimatedValueType = Animated & { to: any; interpolate: any }

/**
 * Returns the right Animated object based on the value type.
 *
 * x: AnimatedValue         --> x
 * 40px                     --> AnimatedValue(40px)
 * [40, 30]                 --> AnimatedValue([40,30])
 * [40, y: AnimatedValue]   --> AnimatedArray([AnimatedValue(40), y])
 *
 * @param value
 */
const ensureAnimated = (
  value: AnimatedValueType | StyleValue = 0
): AnimatedValueType =>
  is.arr(value) && value.some(isAnimated)
    ? new AnimatedArray(value.map(ensureAnimated))
    : isAnimated(value)
    ? value
    : new AnimatedValue(value)

/**
 * Checks if the input value matches the identity value.
 *
 * isValueIdentity(0, 0)              --> true
 * isValueIdentity('0px', 0)          --> true
 * isValueIdentity([0, '0px', 0], 0)  --> true
 *
 * @param styleValue
 * @param id
 */
const isValueIdentity = (styleValue: StyleValue, id: number): boolean =>
  is.arr(styleValue)
    ? styleValue.every(v => isValueIdentity(v, id))
    : is.num(styleValue)
    ? styleValue === id
    : parseFloat(styleValue) === id

/**
 * Checks if the style value is the identity for a given key.
 *
 * isTransformIdentity('scale', 1)               --> true
 * isTransformIdentity('scale', [1,1])
 * isTransformIdentity('rotate3d', [1,1,1,0])    --> true
 * isTransformIdentity('x', 0)                   --> true
 *
 * @param key
 * @param styleValue
 */
const isTransformIdentity = (key: string, styleValue: StyleValue): boolean =>
  key === 'rotate3d'
    ? isValueIdentity(is.arr(styleValue) ? styleValue[3] : styleValue, 0)
    : key.startsWith('scale')
    ? isValueIdentity(styleValue, 1)
    : isValueIdentity(styleValue, 0)

type Style = object & {
  transform?: any
  x?: any
  y?: any
  z?: any
  [k: string]: string
}
type Transform = (arg: any) => [string, boolean]

/**
 * This AnimatedStyle will simplify animated components transforms by
 * interpolating all transform function passed as keys in the style object
 * including shortcuts such as x, y and z for translateX/Y/Z
 */
export class AnimatedStyle extends AnimatedObject {
  constructor({ x, y, z, ...style } = {} as Style) {
    const props: SpringValue[] = []

    // transforms will be an array of functions applied to the props. Each function
    // will return the interpolated transformed string, and a flag indicating if the
    // interpolation result is an identity transform of its own
    const transforms: Transform[] = []

    // first we deal with x, y, z to group them into a single translate3d
    if (x || y || z) {
      // xyz should be an AnimatedValue or AnimatedArray
      const xyz = ensureAnimated([x || 0, y || 0, z || 0])
      // we add it to the array of Animated objects that will be interpolated
      props.push(xyz)

      // we add the interpolation function to our transform array
      transforms.push(([vx, vy, vz]: Value[]) => [
        `translate3d(${mergeUnit(vx, getUnit('x'))},${mergeUnit(
          vy,
          getUnit('y')
        )},${mergeUnit(vz, getUnit('z'))})`,
        isValueIdentity([vx, vy, vz], 0),
      ])
    }

    // then for each style key that matches the transform functions class
    // supports, we add the input value to the props and the interpolation
    // transform function
    each(style, (value, key) => {
      if (domTransforms.some(transform => key.startsWith(transform))) {
        const unit = getUnit(key)
        props.push(ensureAnimated(value))
        transforms.push(
          key === 'transform'
            ? (transform: string) => [transform, transform === '']
            : key === 'rotate3d'
            ? ([x, y, z, deg]) => [
                `rotate3d(${x},${y},${z},${mergeUnit(deg, unit)})`,
                isTransformIdentity(key, deg),
              ]
            : (arg: StyleValue) => [
                is.arr(arg)
                  ? `${key}(${arg.map(v => mergeUnit(v, unit)).join(',')})`
                  : `${key}(${mergeUnit(arg, unit)})`,
                isTransformIdentity(key, arg),
              ]
        )
        delete style[key]
      }
    })

    // finally, we set the transform key of the animated style to the
    // interpolation of all the props, using the transform functions we defined
    // above
    if (props.length > 0) {
      style.transform = interpolate(props, (...args) => {
        let transform = ''
        let identity = true
        for (let i = 0; i < args.length; i++) {
          const [t, id] = transforms[i](args[i])
          transform += ' ' + t
          identity = identity && id
        }
        // if the identity flag was true for all transforms, we set the transform
        // to none, otherwise we return the concatenated transform string
        return identity ? 'none' : transform
      })
    }

    super(style)
  }
}
