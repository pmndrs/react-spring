import { MetaFunction } from 'remix'
import { CarouselQuotes } from '~/components/Carousels/CarouselQuotes'
import { Header } from '~/components/Header/Header'
import { HeroHome } from '~/components/Hero/HeroHome'
import { Copy } from '~/components/Text/Copy'
import { Heading } from '~/components/Text/Heading'

import { QUOTES } from '~/data/fixtures'
import { styled } from '~/styles/stitches.config'

export const meta: MetaFunction = () => {
  return {
    title: 'react-spring',
    description: `With naturally fluid animations you will elevate your UI & interactions. Bringing your apps to life has never been simpler.`,
  }
}

export default function Index() {
  return (
    <>
      <Header
        transparentBackground
        addMarginToMain={false}
        position="fixed"
        alwaysAnimateHeader
      />
      <main>
        <article>
          <HeroHome />
          <Strapline>
            <StraplineCopy fontStyle="$M">
              With naturally fluid animations you will elevate your UI &
              interactions. Bringing your apps to life has never been simpler.
            </StraplineCopy>
            <StraplineHeading tag="h2" fontStyle="$XXL" weight="$bold">
              {`Introducing \nreact-spring`}
            </StraplineHeading>
          </Strapline>
          <CarouselQuotes quotes={QUOTES} />
        </article>
      </main>
    </>
  )
}

const Strapline = styled('section', {
  my: '$10',
  mx: '$25',
})

const StraplineHeading = styled(Heading, {
  my: '$80',
  whiteSpace: 'pre-wrap',
})

const StraplineCopy = styled(Copy, {
  fontWeight: '400',
})
