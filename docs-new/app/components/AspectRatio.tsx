import { ReactNode } from 'react'

import { styled } from '~/styles/stitches.config'

interface AspectRatioProps {
  children: ReactNode
  className?: string
  width?: number
  height?: number
}

export const AspectRatio = ({
  children,
  width = 1,
  height = 1,
  className,
}: AspectRatioProps) => (
  <Container
    className={className}
    css={{
      '@supports(aspect-ratio: 1)': {
        aspectRatio: `${width} / ${height}`,
      },
      '@supports not (aspect-ratio: 1)': {
        '&:before': {
          paddingTop: `${(height / width) * 100}%`,
        },
      },
    }}>
    {children}
  </Container>
)

const Container = styled('div', {
  '@supports(aspect-ratio: 1)': {
    overflow: 'hidden',
  },

  '@supports not (aspect-ratio: 1)': {
    '&:before': {
      display: 'block',
      content: '',
      width: '100%',
    },
  },

  position: 'relative',

  '& > *': {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    minWidth: '100%',
    maxWidth: '100%',
  },
})
