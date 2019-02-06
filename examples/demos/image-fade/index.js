import React, { useState, useEffect } from 'react'
import { useTransition, animated, config } from 'react-spring'
import './styles.css'

const slides = [
  {
    id: 0,
    url:
      'https://images.unsplash.com/photo-1544511916-0148ccdeb877?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1901&q=80i',
  },
  {
    id: 1,
    url:
      'https://images.unsplash.com/photo-1544572571-ab94fd872ce4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1534&q=80',
  },
  {
    id: 2,
    url:
      'https://images.unsplash.com/reserve/bnW1TuTV2YGcoh1HyWNQ_IMG_0207.JPG?ixlib=rb-1.2.1&auto=format&fit=crop&w=1534&q=80',
  },
  {
    id: 3,
    url:
      'https://images.unsplash.com/photo-1540206395-68808572332f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1181&q=80',
  },
]

export default function App() {
  const [index, set] = useState(0)

  const transitions = useTransition(slides[index], item => item.id, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: config.molasses,
  })

  useEffect(() => {
    const id = setInterval(() => set(state => ++state % slides.length), 2000)
    return () => clearInterval(id)
  }, [])

  return transitions.map(({ item, props, key }) => (
    <animated.div
      key={key}
      className="fade-bg"
      style={{ ...props, backgroundImage: `url(${item.url})` }}
    />
  ))
}
