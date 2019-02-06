import { ForwardRefExoticComponent, ComponentPropsWithRef } from 'react'
import { animated } from './renderprops-universal'
export * from './renderprops-universal'

declare const augmentedAnimated: typeof animated &
  {
    [Tag in keyof JSX.IntrinsicElements]: ForwardRefExoticComponent<
      ComponentPropsWithRef<Tag>
    >
  }

export { augmentedAnimated as animated }
