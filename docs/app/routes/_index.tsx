import { MetaFunction } from '@vercel/remix'
import { CarouselQuotes } from '~/components/Carousels/CarouselQuotes'
import { NavigationGrid } from '~/components/Grids/NavigationGrid'
import { Header } from '~/components/Header/Header'
import { HeroHome } from '~/components/Heros/HeroHome'
import { HomeBlockImperative } from '~/components/HomeBlocks/HomeBlockImperative'
import { HomeBlockMore } from '~/components/HomeBlocks/HomeBlockMore'
import { HomeBlockSSR } from '~/components/HomeBlocks/HomeBlockSSR'
import { HomeBlockTarget } from '~/components/HomeBlocks/HomeBlockTarget'

import { COMMUNITY_TILES, QUOTES, TOOL_TILES } from '~/data/fixtures'
import {
  externalLinkGrid,
  homeBlocks,
  main,
  mainHeader,
  maxWrapper,
} from '../styles/routes/_index.css'

export const meta: MetaFunction = () => {
  return [
    {
      title: 'react-spring',
    },
    {
      name: 'description',
      content: `With naturally fluid animations you will elevate your UI & interactions. Bringing your apps to life has never been simpler.`,
    },
  ]
}

export default function Index() {
  return (
    <>
      <Header
        className={mainHeader}
        addMarginToMain={false}
        position="fixed"
        alwaysAnimateHeader
      />
      <main className={main}>
        <article>
          <div className={maxWrapper}>
            <HeroHome />
          </div>
          <CarouselQuotes quotes={QUOTES} />
          <div className={maxWrapper}>
            <div className={homeBlocks}>
              <HomeBlockTarget />
              <HomeBlockImperative />
              <HomeBlockSSR />
              <HomeBlockMore />
            </div>
            <NavigationGrid
              className={externalLinkGrid}
              cols={3}
              tiles={COMMUNITY_TILES}
              subheading={'Join our community'}
              heading={'Share thoughts and join in with active discussions'}
              smallTiles
            />
            <NavigationGrid
              className={externalLinkGrid}
              cols={4}
              tiles={TOOL_TILES}
              subheading={'Check out the ecosystem'}
              heading={'See more fantastic tools from Poimandres'}
              smallTiles
            />
          </div>
        </article>
      </main>
    </>
  )
}
