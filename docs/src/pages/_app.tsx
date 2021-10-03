import { AppProps } from 'next/app'
import { createGlobalStyle } from 'styled-components'
import { DefaultSeo } from 'next-seo'
import { MDXProvider } from '@mdx-js/react'

import { GLOBAL } from 'styles/global'
import { RESET } from 'styles/reset'
import { MARKDOWN } from 'styles/markdown'

import { Splash } from 'components/Splash'
import { ScrollIndicator } from 'components/ScrollIndicator'
import { PageContainer } from 'components/PageContainer'
import Footer from 'components/Footer'
import { CodeBlock } from 'components/CodeBlock'

import { useManageScroll } from 'hooks/useManageScroll'

import { DEFAULT_SEO } from 'references/defaultSeo'

const GlobalStyle = createGlobalStyle`
  ${RESET}
  ${GLOBAL}
  ${MARKDOWN}
`

interface MyAppProps extends AppProps {}

const components = {
  code: CodeBlock,
}

function App({ Component, pageProps }: MyAppProps) {
  useManageScroll()

  return (
    <MDXProvider components={components}>
      <DefaultSeo {...DEFAULT_SEO} />
      <Splash />
      <ScrollIndicator />
      <PageContainer>
        <Component {...pageProps} />
      </PageContainer>
      <Footer />
      <GlobalStyle />
    </MDXProvider>
  )
}

export default App
