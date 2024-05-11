import { styled } from '~/styles/stitches.config'

export const Section = styled('section', {
  px: '$25',

  '& + &': {
    mt: '$50',
  },

  '@tabletUp': {
    px: '$50',
    display: 'flex',
    gap: '$110',
    alignItems: 'center',

    '& > *': {
      flex: '1 0 calc(50% - 5.5rem)',
    },

    '& + &': {
      mt: '$100',
    },
  },
})
