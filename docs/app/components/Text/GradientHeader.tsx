import { Heading } from './Heading'

import { dark, styled } from '~/styles/stitches.config'

export const GradiantHeader = styled(Heading, {
  display: 'inline',
  background: '$blueGreenGradient100',
  '-webkit-background-clip': 'text',
  '-webkit-text-fill-color': 'transparent',
  backgroundClip: 'text',
  textFillColor: 'transparent',
  mb: 4,

  [`.${dark} &`]: {
    background: '$redYellowGradient100',
    '-webkit-background-clip': 'text',
    '-webkit-text-fill-color': 'transparent',
    backgroundClip: 'text',
    textFillColor: 'transparent',
  },
})
