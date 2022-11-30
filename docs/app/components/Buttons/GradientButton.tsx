import { ReactNode } from 'react'
import { dark, styled } from '~/styles/stitches.config'

interface GradientButtonProps {
  children: ReactNode
  href?: string
  tag?: keyof JSX.IntrinsicElements
  className?: string
  variant?: 'regular' | 'small'
}

export const GradientButton = ({
  className,
  href,
  children,
  tag,
  variant = 'regular',
}: GradientButtonProps) => {
  return (
    <Button size={variant} className={className} as={tag} href={href}>
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

  variants: {
    size: {
      small: {
        fontSize: 12,
        fontWeight: 400,
        lineHeight: '140%',

        '& > span': {
          px: '$10',
          py: 5,
        },

        [`.${dark} &`]: {
          fontWeight: 300,
        },
      },
      regular: {
        fontSize: '$XXS',
        lineHeight: '$XXS',

        '& > span': {
          p: '$10 $15',
        },
      },
    },
  },
})
