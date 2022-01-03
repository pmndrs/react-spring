import { useEffect, useState } from 'react'
import { Outlet } from 'remix'
import { styled } from '~/styles/stitches.config'

import { Header } from '../components/Header'

export default function DocsLayout() {
  return (
    <>
      <Header />
      <Main>
        <Outlet />
      </Main>
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

const MyHiddenThing = styled('h1', {
  color: 'pink',
  fontSize: '$XL',
})
