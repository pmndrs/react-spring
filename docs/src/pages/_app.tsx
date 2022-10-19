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
import { COLORS } from '../styles/colors'
// import { FeedbackPopover } from 'components/FeedbackPopover'

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

  @media (min-width: 768px) {
    &::before {
      height: unset;
      margin-top: unset;
    }
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
        <Banner>
          <p>
            Psst! Why not try out our new beta docs site 👀{' '}
            <a href="https://beta.react-spring.dev" rel="noopener noreferrer">
              beta.react-spring.dev
            </a>
          </p>
        </Banner>
        <Header />
        <PageContainer>
          <Component {...pageProps} />
        </PageContainer>
        <Footer />
        {/* <FeedbackPopover /> */}
        <GlobalStyle />
      </MDXProvider>
    </ThemeProvider>
  )
}

const Banner = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  background-color: #2b2b37;
  z-index: 1000;
  width: 100%;
  padding: 16px 24px;
  display: flex;
  justify-content: center;

  & > p {
    font-size: 18px;
    color: ${COLORS.white};

    & > a {
      color: inherit;
      transition: color 200ms ease-out;

      &:hover {
        color: ${COLORS.red};
      }
    }
  }
`

export default App
