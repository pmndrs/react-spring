import * as konva from 'react-konva'
import animated from '../../animated/createAnimatedComponent'
import * as Globals from '../../animated/Globals'
import { update } from '../../animated/FrameLoop'
import { interpolate } from '../../interpolate'
import colorNames from '../../shared/colors'
import { config } from '../../shared/constants'
import createStringInterpolator from '../../shared/stringInterpolation'
import {
  AnimatedComponent,
  CreateAnimatedComponent,
} from '../../types/animated'
import { useChain } from '../../useChain'
import { useSpring } from '../../useSpring'
import { useSprings } from '../../useSprings'
import { useTrail } from '../../useTrail'
import { useTransition } from '../../useTransition'
import { merge } from '../../shared/helpers'

Globals.injectDefaultElement('Group')
Globals.injectStringInterpolator(createStringInterpolator)
Globals.injectColorNames(colorNames)
Globals.injectApplyAnimatedValues(
  (instance, props) => {
    if (instance.nodeType) {
      instance._applyProps(instance, props)
      return
    } else return false
  },
  style => style
)

type KonvaComponents = Pick<
  typeof konva,
  {
    [K in keyof typeof konva]: typeof konva[K] extends React.ReactType
      ? K
      : never
  }[keyof typeof konva]
>

const konvaElements: (keyof KonvaComponents)[] = [
  'Arc',
  'Arrow',
  'Circle',
  'Ellipse',
  'FastLayer',
  'Group',
  'Image',
  'Label',
  'Layer',
  'Line',
  'Path',
  'Rect',
  'RegularPolygon',
  'Ring',
  'Shape',
  'Sprite',
  'Star',
  'Tag',
  'Text',
  'TextPath',
  'Transformer',
  'Wedge',
]

type AnimatedWithKonvaElements = CreateAnimatedComponent &
  { [Tag in keyof KonvaComponents]: AnimatedComponent<KonvaComponents[Tag]> }

// Extend animated with all the available Konva elements
const apply = merge(animated as AnimatedWithKonvaElements, false)
const extendedAnimated = apply(konvaElements)

export { Spring, Trail, Transition } from '../../elements'
export {
  apply,
  config,
  update,
  extendedAnimated as animated,
  extendedAnimated as a,
  interpolate,
  Globals,
  useSpring,
  useTrail,
  useTransition,
  useChain,
  useSprings,
}
