import { ElementType } from 'react'
import * as konva from 'react-konva'

export type KonvaExports = typeof konva

export type Primitives = {
  [P in keyof KonvaExports]: KonvaExports[P] extends ElementType ? P : never
}[keyof KonvaExports]

export const primitives: Primitives[] = [
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
