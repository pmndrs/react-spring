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
import Keyframes from '../../Keyframes'
import fixAuto from './fix-auto'
import Parallax, { ParallaxLayer } from './Parallax'
import colorNames from '../shared/colors'
import createInterpolation from '../shared/interpolation'

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

const domElements = [
  'a',
  'abbr',
  'address',
  'area',
  'article',
  'aside',
  'audio',
  'b',
  'base',
  'bdi',
  'bdo',
  'big',
  'blockquote',
  'body',
  'br',
  'button',
  'canvas',
  'caption',
  'cite',
  'code',
  'col',
  'colgroup',
  'data',
  'datalist',
  'dd',
  'del',
  'details',
  'dfn',
  'dialog',
  'div',
  'dl',
  'dt',
  'em',
  'embed',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'head',
  'header',
  'hgroup',
  'hr',
  'html',
  'i',
  'iframe',
  'img',
  'input',
  'ins',
  'kbd',
  'keygen',
  'label',
  'legend',
  'li',
  'link',
  'main',
  'map',
  'mark',
  'marquee',
  'menu',
  'menuitem',
  'meta',
  'meter',
  'nav',
  'noscript',
  'object',
  'ol',
  'optgroup',
  'option',
  'output',
  'p',
  'param',
  'picture',
  'pre',
  'progress',
  'q',
  'rp',
  'rt',
  'ruby',
  's',
  'samp',
  'script',
  'section',
  'select',
  'small',
  'source',
  'span',
  'strong',
  'style',
  'sub',
  'summary',
  'sup',
  'table',
  'tbody',
  'td',
  'textarea',
  'tfoot',
  'th',
  'thead',
  'time',
  'title',
  'tr',
  'track',
  'u',
  'ul',
  'var',
  'video',
  'wbr', // SVG
  'circle',
  'clipPath',
  'defs',
  'ellipse',
  'foreignObject',
  'g',
  'image',
  'line',
  'linearGradient',
  'mask',
  'path',
  'pattern',
  'polygon',
  'polyline',
  'radialGradient',
  'rect',
  'stop',
  'svg',
  'text',
  'tspan',
]

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

Globals.injectInterpolation(createInterpolation)
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
