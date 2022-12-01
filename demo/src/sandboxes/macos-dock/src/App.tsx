import * as React from 'react'

import { Card } from './components/Card'
import { Dock } from './components/Dock'
import { DockCard } from './components/DockCard'
import { DockDivider } from './components/DockDivider'

import styles from './styles.module.scss'

const GRADIENTS = [
  'https://products.ls.graphics/mesh-gradients/images/03.-Snowy-Mint_1-p-130x130q80.jpeg',
  'https://products.ls.graphics/mesh-gradients/images/04.-Hopbush_1-p-130x130q80.jpeg',
  'https://products.ls.graphics/mesh-gradients/images/06.-Wisteria-p-130x130q80.jpeg',
  'https://products.ls.graphics/mesh-gradients/images/09.-Light-Sky-Blue-p-130x130q80.jpeg',
  'https://products.ls.graphics/mesh-gradients/images/12.-Tumbleweed-p-130x130q80.jpeg',
  'https://products.ls.graphics/mesh-gradients/images/15.-Perfume_1-p-130x130q80.jpeg',
  null,
  'https://products.ls.graphics/mesh-gradients/images/36.-Pale-Chestnut-p-130x130q80.jpeg',
]

export default function App() {
  return (
    <div className={styles.body}>
      <Dock>
        {GRADIENTS.map((src, index) =>
          src ? (
            <DockCard key={src}>
              <Card src={src} />
            </DockCard>
          ) : (
            <DockDivider key={index} />
          )
        )}
      </Dock>
    </div>
  )
}
