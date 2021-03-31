import React from 'react'
import { Link, Route } from 'wouter'
import styles from './styles.module.css'

import GooBlobs from './sandboxes/gooBlobs/src/App'
import Card from './sandboxes/card/src/App'
import FlipCard from './sandboxes/flipCard/src/App'

const links = {
  card: Card,
  'flip-card': FlipCard,
  'goo-blobs': GooBlobs,
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
