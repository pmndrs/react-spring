import * as React from 'react'
import { Link, Route } from 'wouter'
import { Globals } from '@react-spring/web'

import styles from './styles.module.css'

import AnimatingAuto from './sandboxes/animating-auto/src/App'

import Card from './sandboxes/card/src/App'
import CardsStack from './sandboxes/cards-stack/src/App'
import Chain from './sandboxes/chain/src/App'
import CssGradients from './sandboxes/css-gradients/src/App'
import CssKeyframes from './sandboxes/css-keyframes/src/App'
import CssVariables from './sandboxes/css-variables/src/App'

import DecayRocket from './sandboxes/rocket-decay/src/App'
import DraggableList from './sandboxes/draggable-list/src/App'

import ExitBeforeEnter from './sandboxes/exit-before-enter/src/App'

import FlipCard from './sandboxes/flip-card/src/App'
import FloatingButton from './sandboxes/floating-button/src/App'

import GooBlobs from './sandboxes/goo-blobs/src/App'

import ImageFade from './sandboxes/image-fade/src/App'
import MacOSDock from './sandboxes/macos-dock/src/App'

import ListReordering from './sandboxes/list-reordering/src/App'

import Masonry from './sandboxes/masonry/src/App'
import MultiStageTransition from './sandboxes/multistage-transition/src/App'

import NotificationHub from './sandboxes/notification-hub/src/App'
import Noise from './sandboxes/noise/src/App'

import Parallax from './sandboxes/parallax/src/App'
import ParallaxVert from './sandboxes/parallax-vert/src/App'
import ParallaxSticky from './sandboxes/parallax-sticky/src/App'
import PopupModal from './sandboxes/popup-modal/src/App'

import ScrollingWave from './sandboxes/scrolling-wave/src/App'
import SimpleTransition from './sandboxes/simple-transition/src/App'
import Slide from './sandboxes/slide/src/App'
import SvgFilter from './sandboxes/svg-filter/src/App'
import SpringBoxes from './sandboxes/springy-boxes/src/App'
import SmileGrid from './sandboxes/smile-grid/src/App'

import Trail from './sandboxes/trail/src/App'
import Tree from './sandboxes/tree/src/App'

import Viewpager from './sandboxes/viewpager/src/App'

import WebGlSwitch from './sandboxes/webgl-switch/src/App'
import Wordle from './sandboxes/wordle/src/App'

Globals.assign({
  frameLoop: 'always',
})

const links = {
  'animating-auto': AnimatingAuto,
  card: Card,
  'cards-stack': CardsStack,
  chain: Chain,
  'css-gradients': CssGradients,
  'css-keyframes': CssKeyframes,
  'css-variables': CssVariables,
  'draggable-list': DraggableList,
  'exit-before-enter': ExitBeforeEnter,
  'flip-card': FlipCard,
  'floating-button': FloatingButton,
  'goo-blobs': GooBlobs,
  'image-fade': ImageFade,
  'list-reordering': ListReordering,
  'macos-dock': MacOSDock,
  masonry: Masonry,
  'multistage-transition': MultiStageTransition,
  noise: Noise,
  'notification-hub': NotificationHub,
  parallax: Parallax,
  'parallax-sticky': ParallaxSticky,
  'parallax-vert': ParallaxVert,
  'popup-modal': PopupModal,
  'rocket-decay': DecayRocket,
  'scrolling-wave': ScrollingWave,
  'simple-transition': SimpleTransition,
  slide: Slide,
  'smile-grid': SmileGrid,
  'springy-boxes': SpringBoxes,
  'svg-filter': SvgFilter,
  trail: Trail,
  tree: Tree,
  viewpager: Viewpager,
  'webgl-switch': WebGlSwitch,
  wordle: Wordle,
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
          <ul className={styles.linkList}>
            {Object.keys(links).map(link => (
              <li key={link}>
                <DemoCard link={link}>{link}</DemoCard>
              </li>
            ))}
          </ul>
        </div>
      </Route>
      <Route path="/:link">{params => <Example link={params.link} />}</Route>
    </>
  )
}

const DemoCard = ({ children, link }) => {
  return (
    <Link key={link} href={`/${link}`}>
      <a>
        <figure className={styles.card}>
          <div className={styles['image-container']}>
            <img
              src={`https://raw.githubusercontent.com/pmndrs/react-spring/main/demo/src/sandboxes/${link}/thumbnail.png`}
              placeholder="empty"
              loading="lazy"
              alt={children}
            />
          </div>
          <figcaption className={styles.title}>{children}</figcaption>
        </figure>
      </a>
    </Link>
  )
}
