import * as Globals from '../../animated/Globals'
import Animation from '../../animated/Animation'
import AnimatedValue from '../../animated/AnimatedValue'
import SpringAnimation from '../../animated/SpringAnimation'
import controller from '../../animated/AnimatedController'
import { interpolate } from '../../animated/AnimatedInterpolation'
import animated from '../../animated/createAnimatedComponent'
import Spring, { config } from '../../Spring'
import Transition from '../../Transition'
import Trail from '../../Trail'
import Parallax, { ParallaxLayer } from '../../Parallax'
import Keyframes from '../../Keyframes'
import Interpolation from './Interpolation'
import fixAuto from './fix-auto'
import { isUnitlessNumber, domElements, colorNames } from './constants'

const prefixKey = (prefix, key) =>
  prefix + key.charAt(0).toUpperCase() + key.substring(1)
const prefixes = ['Webkit', 'Ms', 'Moz', 'O']

Object.keys(isUnitlessNumber).forEach(function(prop) {
  prefixes.forEach(function(prefix) {
    isUnitlessNumber[prefixKey(prefix, prop)] = isUnitlessNumber[prop]
  })
})

function dangerousStyleValue(name, value, isCustomProperty) {
  var isEmpty = value == null || typeof value === 'boolean' || value === ''
  if (isEmpty) return ''
  if (
    !isCustomProperty &&
    typeof value === 'number' &&
    value !== 0 &&
    !(isUnitlessNumber.hasOwnProperty(name) && isUnitlessNumber[name])
  )
    return value + 'px'
  // Presumes implicit 'px' suffix for unitless numbers
  return ('' + value).trim()
}

function setValueForStyles(node, styles) {
  let style = node.style
  for (let styleName in styles) {
    if (!styles.hasOwnProperty(styleName)) continue
    var isCustomProperty = styleName.indexOf('--') === 0
    var styleValue = dangerousStyleValue(
      styleName,
      styles[styleName],
      isCustomProperty
    )
    if (styleName === 'float') styleName = 'cssFloat'
    if (isCustomProperty) style.setProperty(styleName, styleValue)
    else style[styleName] = styleValue
  }
}

function setValueForAttributes(node, props) {
  let attribute, value
  for (let name in props) {
    if (name !== 'style') {
      value = props[name]
      attribute = node.getAttribute(name)
      if (attribute) node.setAttribute(name, value)
    }
  }
}

Globals.injectInterpolation(Interpolation)
Globals.injectColorNames(colorNames)
Globals.injectBugfixes(fixAuto)
Globals.injectApplyAnimatedValues((instance, props) => {
  if (instance.setNativeProps) {
    instance.setNativeProps(props)
  } else if (instance.nodeType && instance.setAttribute !== undefined) {
    setValueForStyles(instance, props.style)
    setValueForAttributes(instance, props)
  } else return false
}, style => style)

const elements = domElements.reduce(
  (acc, element) => ({ ...acc, [element]: animated(element) }),
  {}
)

Object.assign(animated, elements)
const createAnimatedComponent = comp =>
  console.warn(
    'createAnimatedComponent is deprecated, use animated(comp) instead'
  ) || animated(comp)

export {
  Spring,
  Keyframes,
  Transition,
  Trail,
  Parallax,
  ParallaxLayer,
  Animation,
  SpringAnimation,
  AnimatedValue,
  config,
  animated,
  controller,
  interpolate,
  // deprecated
  createAnimatedComponent,
}
