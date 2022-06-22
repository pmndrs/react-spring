import { styled } from '~/styles/stitches.config'

import { Header } from '../components/Header/Header'

export default function DocsLayout() {
  return (
    <>
      <Header />
      <Main></Main>
    </>
  )
}

const Main = styled('main', {
  padding: '0 $25',
  width: '100%',
  maxWidth: '$document',
  margin: '0 auto',

  '@tabletUp': {
    padding: '0 $15',
  },
})
