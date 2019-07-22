import { Ref, PureComponent } from 'react'
import { SpringConfig } from './renderprops-universal'

interface ParallaxProps extends React.HTMLAttributes<HTMLElement> {
  pages: number

  config?: SpringConfig | ((key: string) => SpringConfig)

  scrolling?: boolean

  horizontal?: boolean

  ref?: Ref<Parallax>
}

export class Parallax extends PureComponent<ParallaxProps> {
  scrollTo: (offset: number) => void
}

interface ParallaxLayerProps extends React.HTMLAttributes<HTMLDivElement> {
  factor?: number

  offset?: number

  speed?: number
}

export class ParallaxLayer extends PureComponent<ParallaxLayerProps> {}
