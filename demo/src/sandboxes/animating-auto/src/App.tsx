import React, { useState } from 'react'
import useMeasure from 'react-use-measure'
import { useSpring, animated } from '@react-spring/web'

import styles from './styles.module.css'

export default function App() {
  const [open, toggle] = useState(false)
  const [ref, { width }] = useMeasure()
  const props = useSpring({ width: open ? width : 0 })

  return (
    <div className="flex fill center" style={{ background: '#272727' }}>
      <div ref={ref} className={styles.main} onClick={() => toggle(!open)}>
        <animated.div className={styles.fill} style={props} />
        <animated.div className={styles.content}>{props.width.to(x => x.toFixed(0))}</animated.div>
      </div>
    </div>
  )
}
