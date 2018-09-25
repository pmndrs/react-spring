import * as Globals from '../../animated/Globals'
import Animation from '../../animated/Animation'
import AnimatedValue from '../../animated/AnimatedValue'
import SpringAnimation from '../../animated/SpringAnimation'
import controller from '../../animated/AnimatedController'
import animated from '../../animated/createAnimatedComponent'
import createInterpolation from '../shared/interpolation'
import colorNames from '../shared/colors'
import { config } from '../shared/constants'
import Spring from '../../Spring'
import Transition from '../../Transition'
import Trail from '../../Trail'
import Keyframes from '../../Keyframes'

Globals.injectDefaultElement('Group')
Globals.injectInterpolation(createInterpolation)
Globals.injectColorNames(colorNames)
Globals.injectApplyAnimatedValues(
  (instance, props) => {
    if (instance.nodeType) {
      instance._applyProps(instance, props)
    } else return false
  },
  style => style
)

const konvaElements = [
  'Layer',
  'FastLayer',
  'Group',
  'Label',
  'Rect',
  'Circle',
  'Ellipse',
  'Wedge',
  'Line',
  'Sprite',
  'Image',
  'Text',
  'TextPath',
  'Star',
  'Ring',
  'Arc',
  'Tag',
  'Path',
  'RegularPolygon',
  'Arrow',
  'Shape',
  'Transformer',
]

Object.assign(
  animated,
  konvaElements.reduce(
    (acc, element) => ({ ...acc, [element]: animated(element) }),
    {}
  )
)

export {
  Spring,
  Keyframes,
  Transition,
  Trail,
  Animation,
  SpringAnimation,
  AnimatedValue,
  config,
  animated,
  controller,
  Globals,
}
