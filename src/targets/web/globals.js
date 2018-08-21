import memoize from '@emotion/memoize'
import * as Globals from '../../animated/Globals'
import colorNames from '../shared/colors'
import createInterpolation from '../shared/interpolation'
import fixAuto from './fix-auto'

const isUnitlessNumberRegExp = codegen.require('./is-unitless-prop')
const isUnitlessNumber = memoize(
  isUnitlessNumberRegExp.bind(isUnitlessNumberRegExp)
)

function dangerousStyleValue(name, value, isCustomProperty) {
  if (value == null || typeof value === 'boolean' || value === '') return ''
  if (
    !isCustomProperty &&
    typeof value === 'number' &&
    value !== 0 &&
    !isUnitlessNumber(name)
  )
    return value + 'px'
  // Presumes implicit 'px' suffix for unitless numbers
  return ('' + value).trim()
}

Globals.injectInterpolation(createInterpolation)
Globals.injectColorNames(colorNames)
Globals.injectBugfixes(fixAuto)
Globals.injectApplyAnimatedValues(
  (instance, props) => {
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
  },
  style => style
)
