import * as konva from 'react-konva'
import { ElementType } from 'react'
import { createAnimatedComponent, withExtend } from '../../animated'
import {
  AnimatedComponent,
  CreateAnimatedComponent,
} from '../../types/animated'

export { update } from '../../animated/FrameLoop'

type KonvaExports = typeof konva

type KonvaElements = {
  [P in keyof KonvaExports]: KonvaExports[P] extends ElementType ? P : never
}[keyof KonvaExports]

type KonvaComponents = {
  [Tag in KonvaElements]: AnimatedComponent<KonvaExports[Tag]>
}

const elements: KonvaElements[] = [
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

// Extend animated with all the available Konva elements
export const animated = withExtend(
  createAnimatedComponent as CreateAnimatedComponent & KonvaComponents
).extend(elements)

export { animated as a }

/** @deprecated Use `animated.extend` instead */
export const apply = animated.extend
