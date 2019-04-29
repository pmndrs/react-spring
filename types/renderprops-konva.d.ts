import {
  ForwardRefExoticComponent,
  ComponentPropsWithRef,
  ElementType,
} from 'react'
import * as konva from 'react-konva'
import { animated } from './renderprops-universal'
export * from './renderprops-universal'

type KonvaComponents = Pick<
  typeof konva,
  {
    [K in keyof typeof konva]: typeof konva[K] extends ElementType ? K : never
  }[keyof typeof konva]
>

declare const augmentedAnimated: typeof animated &
  {
    [Tag in keyof KonvaComponents]: ForwardRefExoticComponent<
      ComponentPropsWithRef<KonvaComponents[Tag]>
    >
  }

export { augmentedAnimated as animated }
