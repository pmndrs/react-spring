import {
  animated as createAnimatedComponent,
  AnimatedComponent,
} from './lib/common'

export const animated: typeof createAnimatedComponent &
  { [Tag in keyof JSX.IntrinsicElements]: AnimatedComponent<Tag> }

export {
  config,
  AnimatedValue,
  SpringConfig,
  TransitionPhase,
} from './lib/common'

export * from './lib/useSpring'
export * from './lib/useSprings'
export * from './lib/useTransition'
export * from './lib/useTrail'
export * from './lib/useChain'
export * from './lib/render-props'
