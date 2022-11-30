import { dark, styled } from '~/styles/stitches.config'

export const BadgeNew = () => {
  return <Badge>New</Badge>
}

const Badge = styled('span', {
  fontSize: '1.2rem',
  lineHeight: '1.2rem',
  fontWeight: '$bold',
  px: 6,
  py: 4,
  borderRadius: '$r8',
  color: '$white',
  background: '$blueGreenGradient100',

  [`.${dark} &`]: {
    background: '$redYellowGradient100',
  },
})
