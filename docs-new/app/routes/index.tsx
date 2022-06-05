import { MetaFunction } from 'remix'
import { CarouselQuotes } from '~/components/Carousels/CarouselQuotes'
import { NavigationGrid } from '~/components/Grids/NavigationGrid'
import { Header } from '~/components/Header/Header'
import { HeroHome } from '~/components/Heros/HeroHome'
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
      <Main>
        <article>
          <HeroHome />
          <CarouselQuotes quotes={QUOTES} />
          <ExternalLinkGrid
            cols={3}
            tiles={COMMUNITY_TILES}
            subheading={'Join our community'}
            heading={'Share thoughts and join in with active discussions'}
            smallTiles
          />
          <ExternalLinkGrid
            cols={4}
            tiles={TOOL_TILES}
            subheading={'Check out the ecosystem'}
            heading={'See more fantastic tools from Poimandres'}
            smallTiles
          />
        </article>
      </Main>
    </>
  )
}

const ExternalLinkGrid = styled(NavigationGrid, {
  mx: '$25',
  '@tabletUp': {
    mx: '$50',
  },
})

const Main = styled('main', {
  width: '100%',
  overflowX: 'hidden',
})
