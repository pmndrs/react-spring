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

export const primitives: { [key in ZdogElements]: ElementType } = {
  Anchor: Zdog.Anchor,
  Shape: Zdog.Shape,
  Group: Zdog.Group,
  Rect: Zdog.Rect,
  RoundedRect: Zdog.RoundedRect,
  Ellipse: Zdog.Ellipse,
  Polygon: Zdog.Polygon,
  Hemisphere: Zdog.Hemisphere,
  Cylinder: Zdog.Cylinder,
  Cone: Zdog.Cone,
  Box: Zdog.Box,
}
