import { useEffect } from 'react'
import { animated, useSpring } from '@react-spring/web'
import './App.css'

function App() {
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
    <div className="App">
      <animated.div className="spring" style={styles} />
    </div>
  )
}

export default App
