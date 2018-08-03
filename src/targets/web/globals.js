import * as Globals from '../../animated/Globals'
import colorNames from '../shared/colors'
import createInterpolation from '../shared/interpolation'
import fixAuto from './fix-auto'

alert('hey there')

const isUnitlessNumber = {
  animationIterationCount: true,
  borderImageOutset: true,
  borderImageSlice: true,
  borderImageWidth: true,
  boxFlex: true,
  boxFlexGroup: true,
  boxOrdinalGroup: true,
  columnCount: true,
  columns: true,
  flex: true,
  flexGrow: true,
  flexPositive: true,
  flexShrink: true,
  flexNegative: true,
  flexOrder: true,
  gridRow: true,
  gridRowEnd: true,
  gridRowSpan: true,
  gridRowStart: true,
  gridColumn: true,
  gridColumnEnd: true,
  gridColumnSpan: true,
  gridColumnStart: true,
  fontWeight: true,
  lineClamp: true,
  lineHeight: true,
  opacity: true,
  order: true,
  orphans: true,
  tabSize: true,
  widows: true,
  zIndex: true,
  zoom: true,
  // SVG-related properties
  fillOpacity: true,
  floodOpacity: true,
  stopOpacity: true,
  strokeDasharray: true,
  strokeDashoffset: true,
  strokeMiterlimit: true,
  strokeOpacity: true,
  strokeWidth: true,
}

const prefixKey = (prefix, key) =>
  prefix + key.charAt(0).toUpperCase() + key.substring(1)
const prefixes = ['Webkit', 'Ms', 'Moz', 'O']

Object.keys(isUnitlessNumber).forEach(prop =>
  prefixes.forEach(
    pre => (isUnitlessNumber[prefixKey(pre, prop)] = isUnitlessNumber[prop])
  )
)

function dangerousStyleValue(name, value, isCustomProperty) {
  if (value == null || typeof value === 'boolean' || value === '') return ''
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

Globals.injectInterpolation(createInterpolation)
Globals.injectColorNames(colorNames)
Globals.injectBugfixes(fixAuto)
Globals.injectApplyAnimatedValues((instance, props) => {
  if (instance.nodeType && instance.setAttribute !== undefined) {
    const { style, ...attributes } = props

    // Set styles ...
    for (let styleName in style) {
      if (!style.hasOwnProperty(styleName)) continue
      var isCustomProperty = styleName.indexOf('--') === 0
      var styleValue = dangerousStyleValue(
        styleName,
        style[styleName],
        isCustomProperty
      )
      if (styleName === 'float') styleName = 'cssFloat'
      if (isCustomProperty) instance.style.setProperty(styleName, styleValue)
      else instance.style[styleName] = styleValue
    }

    // Set attributes ...
    for (let name in attributes) {
      if (instance.getAttribute(name))
        instance.setAttribute(name, attributes[name])
    }
  } else return false
}, style => style)
