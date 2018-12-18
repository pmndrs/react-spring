import React, { useEffect } from 'react'
import { useKeyframes, animated } from 'react-spring/hooks'
import './styles.css'
import { useChain } from '../../../../dist/hooks'

const useScript = useKeyframes.spring(async next => {
  while (true) {
    await next({
      left: '0%',
      top: '0%',
      width: '100%',
      height: '100%',
      config: { duration: 0 },
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
})

export default function App() {
  const props = useScript()
  return (
    <div className="script-main">
      <animated.div className="script-box" style={props} />
    </div>
  )
}
