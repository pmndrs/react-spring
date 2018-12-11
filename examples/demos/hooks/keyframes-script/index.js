import React, { useState, useEffect } from 'react'
import { useKeyframes, animated } from 'react-spring/hooks'
import './styles.css'

let next = undefined
let cancel = undefined
let script = async () => {
  if (next) {
    cancel()
    await next({
      left: '0%',
      top: '0%',
      width: '100%',
      height: '100%',
      config: { duration: 0 }
    })
    await next({ height: '50%' })
    await next({ width: '50%', left: '50%' })
    await next({ top: '0%', height: '100%' })
    await next({ top: '50%', height: '50%' })
    await next({ width: '100%', left: '0%' })
    await next({ width: '50%' })
    await next({ top: '0%', height: '100%' })
    await next({ width: '100%' })
  }
}

const useScript = useKeyframes.spring(
  async (fn, cn) => void ((next = fn), (cancel = cn))
)

export default function App() {
  const [, forceRender] = useState(null)
  const props = useScript()
  useEffect(() => void script(), [])
  return (
    <div className="script-main" onClick={script}>
      <animated.div className="script-box" style={props} />
    </div>
  )
}
