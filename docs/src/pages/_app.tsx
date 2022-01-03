import { AppProps } from 'next/app'
import { createGlobalStyle, ThemeProvider } from 'styled-components'
import { DefaultSeo } from 'next-seo'
import { MDXProvider } from '@mdx-js/react'
import { useEffect } from 'react'

import { GLOBAL } from 'styles/global'
import { RESET } from 'styles/reset'
import { MARKDOWN } from 'styles/markdown'
import { SpringTheme } from 'styles/theme'

import { Header } from 'components/Splash'
import { PageContainer } from 'components/PageContainer'
import { Footer } from 'components/Footer'
import { CodeBlock } from 'components/CodeBlock'

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
  useEffect(() => {
    /**
     * Attach plausible on mount
     */
    window.plausible =
      window.plausible ||
      function () {
        void (window.plausible.q = window.plausible.q || []).push(arguments)
      }
  }, [])

  return (
    <ThemeProvider theme={SpringTheme}>
      <MDXProvider components={components}>
        <DefaultSeo {...DEFAULT_SEO} />
        <Header />
        <PageContainer>
          <Component {...pageProps} />
        </PageContainer>
        <Footer />
        <GlobalStyle />
      </MDXProvider>
    </ThemeProvider>
  )
}

export default App
