let isUnitlessNumber: { [key: string]: true } = {
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

const prefixKey = (prefix: string, key: string) =>
  prefix + key.charAt(0).toUpperCase() + key.substring(1)
const prefixes = ['Webkit', 'Ms', 'Moz', 'O']

isUnitlessNumber = Object.keys(isUnitlessNumber).reduce((acc, prop) => {
  prefixes.forEach(prefix => (acc[prefixKey(prefix, prop)] = acc[prop]))
  return acc
}, isUnitlessNumber)

function dangerousStyleValue(
  name: string,
  value: string | number | boolean | null,
  isCustomProperty: boolean
) {
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

const attributeCache: { [key: string]: string } = {}

export function applyAnimatedValues(
  instance: any,
  props: { [key: string]: any }
) {
  if (!instance.nodeType || !instance.setAttribute) {
    return false
  }

  const { style, children, scrollTop, scrollLeft, ...attributes } = props!

  if (scrollTop !== void 0) instance.scrollTop = scrollTop
  if (scrollLeft !== void 0) instance.scrollLeft = scrollLeft

  // Set textContent, if children is an animatable value
  if (children !== void 0) instance.textContent = children

  // Apply CSS styles
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

  const isFilterElement =
    instance.nodeName === 'filter' ||
    (instance.parentNode && instance.parentNode.nodeName === 'filter')

  // Apply DOM attributes
  for (let name in attributes) {
    // Attributes are written in dash case
    const attributeName =
      isFilterElement || instance.hasAttribute(name)
        ? name
        : attributeCache[name] ||
          (attributeCache[name] = name.replace(
            /([A-Z])/g,
            n => '-' + n.toLowerCase()
          ))

    instance.setAttribute(attributeName, attributes[name])
  }
}
