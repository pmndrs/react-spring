import { ForwardRefExoticComponent, ComponentPropsWithRef } from 'react'
import { animated } from './universal'
export * from './universal'

declare const augmentedAnimated: typeof animated &
  {
    [Tag in keyof JSX.IntrinsicElements]: ForwardRefExoticComponent<
      ComponentPropsWithRef<Tag>
    >
  }

export { augmentedAnimated as animated }
