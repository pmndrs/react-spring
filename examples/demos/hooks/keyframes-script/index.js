import React from 'react'
import { useKeyframes, animated } from 'react-spring/hooks'
import './styles.css'

export default function App () {
  const props = useKeyframes.Spring(async next => {
    await next({
      from: { left: '0%', top: '0%', width: '0%', height: '0%' },
      width: '100%',
      height: '100%'
    })
    while (true) {
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

  return (
    <div className="script-main">
      <animated.div className='script-box' style={props} />
    </div>
  )
}