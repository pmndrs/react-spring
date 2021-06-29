import './styles.css'
import React, { useState } from 'react'
import UserTiles from './UserTiles.jsx'

let tiles1 = [
  { letter: 'A', value: 1, id: 0 },
  { letter: 'X', value: 10, id: 1 },
  { letter: 'G', value: 4, id: 6 },
  { letter: 'D', value: 3, id: 2 },
  { letter: 'E', value: 1, id: 3 },
  { letter: 'A', value: 1, id: 4 },
  { letter: 'C', value: 15, id: 5 },
  { letter: 'C', value: 15, id: 7 },
  { letter: 'C', value: 15, id: 8 },
]

let tiles2 = [
  { letter: 'A', value: 1, id: 0 },
  { letter: 'X', value: 10, id: 1 },
  { letter: 'D', value: 3, id: 2 },
  { letter: 'E', value: 1, id: 3 },
  { letter: 'A', value: 1, id: 4 },
  { letter: 'C', value: 15, id: 5 },
  { letter: 'C', value: 15, id: 7 },
  { letter: 'C', value: 15, id: 8 },
]

export default function App() {
  const [tiles, setTiles] = useState(tiles1)

  const setTiles2 = () => {
    setTiles(tiles2)
  }

  const setTiles1 = () => {
    setTiles(tiles1)
  }
  return (
    <div>
      <UserTiles tiles={tiles} setTiles1={setTiles1} setTiles2={setTiles2} />
      <ol>
        <li>Click Button 1</li>
        <li>Click Button 2</li>
        <li>Click on a tile to drag</li>
        <li>Notice how the last tile shifts over</li>
        <li>
          Look at console log, repeat instructions above, observe controllers in
          springref never get detached
        </li>
      </ol>
      <div className="buttons">
        <button className="button1" onClick={setTiles2}>
          Button 1 (Removes a tile)
        </button>

        <button className="button2" onClick={setTiles1}>
          Button 2 (Adds tile back)
        </button>
      </div>
    </div>
  )
}
