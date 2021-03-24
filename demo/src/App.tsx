import * as React from 'react'
import { Link, Route } from 'wouter'

import GooBlobs from './sandboxes/gooBlobs/src/App'
import Card from './sandboxes/card/src/App'

const links: {
  [key: string]: () => JSX.Element
} = {
  'goo-blobs': GooBlobs,
  card: Card,
}

const Example = ({ link }: { link: string }) => {
  const Component = links[link]
  return (
    <div className="main">
      <Link href="/">
        <a>← Back</a>
      </Link>
      <Component />
    </div>
  )
}

export default function App() {
  return (
    <>
      <Route path="/">
        <h1>Spring demos</h1>
        <h2>Sandboxes</h2>
        <div>
          {Object.keys(links).map(link => (
            <Link key={link} href={`/${link}`}>
              <a>{link}</a>
            </Link>
          ))}
        </div>
      </Route>
      <Route path="/:link">{params => <Example link={params.link} />}</Route>
    </>
  )
}
