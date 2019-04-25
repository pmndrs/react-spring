import * as konva from 'react-konva'
import animated, { withExtend } from '../../animated/createAnimatedComponent'
import * as Globals from '../../animated/Globals'
import { update } from '../../animated/FrameLoop'
import Controller from '../../animated/Controller'
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

Globals.assign({
  defaultElement: 'Group',
  createStringInterpolator,
  colorNames,
  applyAnimatedValues(instance, props) {
    if (!instance.nodeType) return false
    instance._applyProps(instance, props)
  },
})

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
const konvaAnimated = withExtend(animated as AnimatedWithKonvaElements).extend(
  konvaElements
)

/** @deprecated Use `animated.extend` instead */
export const apply = konvaAnimated.extend

export * from '../../legacy'
export {
  config,
  update,
  konvaAnimated as animated,
  konvaAnimated as a,
  interpolate,
  Controller,
  Globals,
  useSpring,
  useTrail,
  useTransition,
  useChain,
  useSprings,
}
