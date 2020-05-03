import { ElementType } from 'react'
import * as Zdog from 'react-zdog'

type ZdogExports = typeof Zdog
type ZdogElements = {
  [P in keyof ZdogExports]: P extends 'Illustration'
    ? never
    : ZdogExports[P] extends ElementType
    ? P
    : never
}[keyof ZdogExports]

export const primitives: ZdogElements[] = [
  'Anchor',
  'Shape',
  'Group',
  'Rect',
  'RoundedRect',
  'Ellipse',
  'Polygon',
  'Hemisphere',
  'Cylinder',
  'Cone',
  'Box',
]
