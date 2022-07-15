import { AppProps } from 'next/app'
import { createGlobalStyle, ThemeProvider } from 'styled-components'
import { DefaultSeo } from 'next-seo'
import { MDXProvider } from '@mdx-js/react'
import { useEffect } from 'react'
import styled from 'styled-components'

import { GLOBAL } from 'styles/global'
import { RESET } from 'styles/reset'
import { MARKDOWN } from 'styles/markdown'
import { SpringTheme } from 'styles/theme'

import { Header } from 'components/Splash'
import { PageContainer } from 'components/PageContainer'
import { Footer } from 'components/Footer'
import { CodeBlock } from 'components/CodeBlock'

import { DEFAULT_SEO } from 'references/defaultSeo'
import { FeedbackPopover } from 'components/FeedbackPopover'

const GlobalStyle = createGlobalStyle`
  ${RESET}
  ${GLOBAL}
  ${MARKDOWN}
`

interface MyAppProps extends AppProps {}

const components = {
  code: CodeBlock,
  h1: props => <H1 {...props} />,
}

const H1 = styled.h1`
  &::before {
    display: block;
    content: ' ';
    margin-top: -140px;
    height: 140px;
    visibility: hidden;
    pointer-events: none;
  }
`

function App({ Component, pageProps }: MyAppProps) {
  useEffect(() => {
    /**
     * Attach plausible on mount
     */
    if (process.env.NEXT_PUBLIC_PLAUSIBLE) {
      window.plausible =
        window.plausible ||
        function () {
          void (window.plausible.q = window.plausible.q || []).push(arguments)
        }
    }
  }, [])

  return (
    <ThemeProvider theme={SpringTheme}>
      <MDXProvider components={components}>
        <DefaultSeo {...DEFAULT_SEO} />
        <Header />
        <PageContainer>
          <script
            async
            type="text/javascript"
            src="//cdn.carbonads.com/carbon.js?serve=CEAIPK7I&placement=react-springdev"
            id="_carbonads_js"
          />
          <Component {...pageProps} />
        </PageContainer>
        <Footer />
        <FeedbackPopover />
        <GlobalStyle />
      </MDXProvider>
    </ThemeProvider>
  )
}

export default App
