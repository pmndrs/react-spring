import * as React from 'react'

import { Keyframes } from '../'

const Container = Keyframes.Spring({
  open: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  close: {
    to: { opacity: 0 },
  },
})

export const NoTypeWarnings = (
  <Container state="open">
    {(styles: { opacity: number }) => <div style={styles}>Hello</div>}
  </Container>
)
