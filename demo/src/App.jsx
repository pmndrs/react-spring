import React from 'react'
import { Link, Route } from 'wouter'
import styles from './styles.module.css'

import Card from './sandboxes/card/src/App'
import Chain from './sandboxes/chain/src/App'
import FlipCard from './sandboxes/flip-card/src/App'
import GooBlobs from './sandboxes/goo-blobs/src/App'
import Slide from './sandboxes/slide/src/App'
import DraggableList from './sandboxes/draggable-list/src/App'
import CardsStack from './sandboxes/cards-stack/src/App'
import Viewpager from './sandboxes/viewpager/src/App'
import SimpleTransition from './sandboxes/simple-transition/src/App'
import ImageFade from './sandboxes/image-fade/src/App'
import ListReordering from './sandboxes/list-reordering/src/App'
import Masonry from './sandboxes/masonry/src/App'
import AnimatingAuto from './sandboxes/animating-auto/src/App'
import MultiStageTransition from './sandboxes/multistage-transition/src/App'
import Trail from './sandboxes/trail/src/App'
import SvgFilter from './sandboxes/svg-filter/src/App'
import CssKeyframes from './sandboxes/css-keyframes/src/App'
import NotificationHub from './sandboxes/notification-hub/src/App'
import Tree from './sandboxes/tree/src/App'
import DecayRocket from './sandboxes/rocket-decay/src/App'
import Parallax from './sandboxes/parallax/src/App'
import ParallaxVert from './sandboxes/parallax-vert/src/App'
import ParallaxSticky from './sandboxes/parallax-sticky/src/App'
import SimpleThree from './sandboxes/simple-three/src/App'

const links = {
  card: Card,
  chain: Chain,
  'flip-card': FlipCard,
  'goo-blobs': GooBlobs,
  slide: Slide,
  'draggable-list': DraggableList,
  'cards-stack': CardsStack,
  viewpager: Viewpager,
  'simple-transition': SimpleTransition,
  'image-fade': ImageFade,
  'list-reordering': ListReordering,
  masonry: Masonry,
  'animating-auto': AnimatingAuto,
  'multistage-transition': MultiStageTransition,
  trail: Trail,
  'svg-filter': SvgFilter,
  'css-keyframes': CssKeyframes,
  'notification-hub': NotificationHub,
  tree: Tree,
  'decay-rocket': DecayRocket,
  parallax: Parallax,
  'parallax-vert': ParallaxVert,
  'parallax-sticky': ParallaxSticky,
  three: SimpleThree,
}

const Example = ({ link }) => {
  const Component = links[link]
  return (
    <>
      <Link href="/">
        {/*eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a className={styles.back}>← Back</a>
      </Link>
      <Component />
    </>
  )
}

export default function App() {
  return (
    <>
      <Route path="/">
        <div className={styles.page}>
          <h1>React Spring demos</h1>
          <h2>Sandboxes</h2>
          <div className={styles.linkList}>
            {Object.keys(links).map(link => (
              <Link key={link} href={`/${link}`}>
                {/*eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a className={styles.link}>{link}</a>
              </Link>
            ))}
          </div>
        </div>
      </Route>
      <Route path="/:link">{params => <Example link={params.link} />}</Route>
    </>
  )
}
