import React from 'react'
import { Link, Route } from 'wouter'
import styles from './styles.module.css'

import AnimatingAuto from './sandboxes/animating-auto/src/App'

import Card from './sandboxes/card/src/App'
import CardsStack from './sandboxes/cards-stack/src/App'
import Chain from './sandboxes/chain/src/App'
import CssKeyframes from './sandboxes/css-keyframes/src/App'
import CssVariables from './sandboxes/css-variables/src/App'

import DecayRocket from './sandboxes/rocket-decay/src/App'
import DraggableList from './sandboxes/draggable-list/src/App'

import ExitBeforeEnter from './sandboxes/exit-before-enter/src/App'

import FlipCard from './sandboxes/flip-card/src/App'

import GooBlobs from './sandboxes/goo-blobs/src/App'

import ImageFade from './sandboxes/image-fade/src/App'

import ListReordering from './sandboxes/list-reordering/src/App'

import Masonry from './sandboxes/masonry/src/App'
import MultiStageTransition from './sandboxes/multistage-transition/src/App'

import NotificationHub from './sandboxes/notification-hub/src/App'

import Parallax from './sandboxes/parallax/src/App'
import ParallaxVert from './sandboxes/parallax-vert/src/App'
import ParallaxSticky from './sandboxes/parallax-sticky/src/App'

import SimpleTransition from './sandboxes/simple-transition/src/App'
import Slide from './sandboxes/slide/src/App'
import SvgFilter from './sandboxes/svg-filter/src/App'

import Trail from './sandboxes/trail/src/App'
import Tree from './sandboxes/tree/src/App'

import Viewpager from './sandboxes/viewpager/src/App'

const links = {
  'animating-auto': AnimatingAuto,
  card: Card,
  'cards-stack': CardsStack,
  chain: Chain,
  'css-keyframes': CssKeyframes,
  'css-variables': CssVariables,
  'decay-rocket': DecayRocket,
  'draggable-list': DraggableList,
  'exit-before-enter': ExitBeforeEnter,
  'flip-card': FlipCard,
  'goo-blobs': GooBlobs,
  'image-fade': ImageFade,
  'list-reordering': ListReordering,
  masonry: Masonry,
  'multistage-transition': MultiStageTransition,
  'notification-hub': NotificationHub,
  parallax: Parallax,
  'parallax-vert': ParallaxVert,
  'parallax-sticky': ParallaxSticky,
  'simple-transition': SimpleTransition,
  slide: Slide,
  'svg-filter': SvgFilter,
  trail: Trail,
  viewpager: Viewpager,
  tree: Tree,
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
