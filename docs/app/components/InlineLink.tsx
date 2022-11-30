export const InlineLinkStyles = {
  position: 'relative',
  textDecoration: 'none',

  '&:after': {
    position: 'absolute',
    bottom: -1,
    left: 0,
    content: '',
    width: '100%',
    height: 2,
    backgroundColor: '$red100',

    '@motion': {
      transition: 'width 200ms ease-out',
    },
  },

  '&:hover:after': {
    width: 0,
    left: 'unset',
    right: 0,
  },
}
