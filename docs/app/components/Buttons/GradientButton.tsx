import { ReactNode } from 'react'
import { dark, styled } from '~/styles/stitches.config'

interface GradientButtonProps {
  href: string
  children: ReactNode
}

export const GradientButton = ({ href, children }: GradientButtonProps) => {
  return (
    <Button href={href}>
      <span>{children}</span>
    </Button>
  )
}

const Button = styled('a', {
  color: '$steel100',
  borderRadius: '$r8',
  p: 2,
  backgroundClip: 'content-box',
  position: 'relative',
  fontSize: '$XXS',
  lineHeight: '$XXS',
  display: 'inline-block',
  zIndex: 0,

  '&:before': {
    content: '',
    width: '100%',
    height: '100%',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: -1,
    borderRadius: 'inherit',
    background: '$redYellowGradient100',
    transition: 'filter 250ms ease-out',
  },

  [`.${dark} &:before`]: {
    background: '$blueGreenGradient100',
  },

  '& > span': {
    p: '$10 $15',
    display: 'block',
    backgroundColor: '$white',
    borderRadius: 'inherit',
  },

  '&:hover:before': {
    filter: 'brightness(120%)',
  },

  [`.${dark} &:hover:before`]: {
    filter: 'brightness(140%)',
  },
})
