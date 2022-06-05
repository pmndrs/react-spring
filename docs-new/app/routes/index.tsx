import { MetaFunction } from 'remix'
import { CarouselQuotes } from '~/components/Carousels/CarouselQuotes'
import { NavigationGrid } from '~/components/Grids/NavigationGrid'
import { Header } from '~/components/Header/Header'
import { Copy } from '~/components/Text/Copy'
import { Heading } from '~/components/Text/Heading'

import { COMMUNITY_TILES, NAV_TILES, QUOTES, TOOL_TILES } from '~/data/fixtures'
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
      <Header addMarginToMain={false} position="fixed" alwaysAnimateHeader />
      <main>
        <article>
          <Strapline>
            <StraplineCopy fontStyle="$M">
              With naturally fluid animations you will elevate your UI &
              interactions. Bringing your apps to life has never been simpler.
            </StraplineCopy>
          </Strapline>
          <section>
            <h2>Why springs and not durations</h2>
            <p>
              The principle you will be working with is called a spring, it does
              not have a defined curve or a set duration. In that it differs
              greatly from the animation you are probably used to. We think of
              animation in terms of time and curves, but that in itself causes
              most of the struggle we face when trying to make elements on the
              screen move naturally, because nothing in the real world moves
              like that.
            </p>
            <p>
              We are so used to time-based animation that we believe that
              struggle is normal, dealing with arbitrary curves, easings, time
              waterfalls, not to mention getting this all in sync. As Andy
              Matuschak (ex Apple UI-Kit developer) expressed it once: Animation
              APIs parameterized by duration and curve are fundamentally opposed
              to continuous, fluid interactivity.
            </p>
            <p>
              Springs change that, animation becomes easy and approachable,
              everything you do looks and feels natural by default.{' '}
            </p>
          </section>
          <CarouselQuotes quotes={QUOTES} />
          <NavigationGrid
            cols={3}
            tiles={COMMUNITY_TILES}
            subheading={'Join our community'}
            heading={'Share thoughts and join in with active discussions'}
          />
          <NavigationGrid
            cols={3}
            tiles={TOOL_TILES}
            subheading={'Check out the ecosystem'}
            heading={'See more fantastic tools from Poimandres'}
          />
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
