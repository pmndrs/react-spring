import { useEffect } from 'react'
import type { NextPage } from 'next'
import { animated, useSpring } from '@react-spring/web'

import style from '../styles/index.module.css'

const IndexPage: NextPage = () => {
  const [styles, api] = useSpring(
    () => ({
      from: { opacity: 0 },
    }),
    []
  )

  useEffect(() => {
    api.start({ opacity: 1 })
  }, [api])

  return (
    <div>
      <animated.div className={style.spring} style={styles} />
    </div>
  )
}

export default IndexPage
