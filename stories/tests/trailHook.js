import React from 'react'
import { testStories } from '../index'
import { animated } from '../../src/targets/web'
import { useTrail } from '../../src/addons/TrailHook'
import {
  useSpringKeyframes,
  useTrailKeyframes
} from '../../src/addons/KeyframesHook'

function rand (frm, to) {
  return ~~(Math.random() * (to - frm)) + frm
}

function createColors (length = 100) {
  let colors = []
  while (colors.length < length) {
    colors.push(`rgb(${rand(0, 254)}, ${rand(0, 200)}, ${rand(0, 240)})`)
  }

  return colors
}

export function Hooked () {
  const [state, setState] = React.useState({
    items: [1],
    colors: createColors(5)
  })
  const [renderedItems, setTrail] = useTrail({
    items: state.items,
    keys: state.items,
    from: { coords: [0, 0] },
    onRest: val => console.log('on rest was called with ', val)
  })

  React.useEffect(() => {
    window.addEventListener('mousemove', ({ pageX, pageY }) => {
      setTrail({ coords: [pageX, pageY] })
    })
    // return window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <ul>
      {renderedItems.map(({ item, style }, idx) => {
        console.log(item, style, "value of item and style")
        return (
          <animated.li
            style={{
              background: state.colors[idx],
              zIndex: 100 - idx,
              height: '100px',
              position: 'absolute',
              width: '100px',
              display: 'flex',
              alignItems: 'center',
              willChange: 'transform',
              justifyContent: 'center',
              borderRadius: '50%',
              boxShadow: '0px 5px 25px -10px rgba(0, 0, 0, 0.2)',
              fontWeight: 'bold',
              fontSize: '30px',
              color: 'white',
              transform: style.coords.interpolate(
                (x, y) => `translate3d(${x - 35}px, ${y - 35}px, 0)`
              )
            }}
          >
            {item}
          </animated.li>
        )
      })}
    </ul>
  )
}

testStories.add('Trails Hook', () => <Hooked />)

function KeyframedTrail () {
  const [items, setItems] = React.useState(
    new Array(6).fill(0).map((_, i) => i)
  )
  const colors = createColors(5)
  const [state, setState] = React.useState('first')
  const [renderedItems, setTrail] = useTrailKeyframes(
    {
      items: items,
      keys: items,
      state: state,
      states: {
        first: function (next) {
          next({ coords: [0, 600] })
            .then(() => next({ coords: [600, 600] }))
            .then(() => next({ coords: [600, 0] }, true))
        },
        second: [
          { coords: [600, 600] },
          { coords: [0, 600] },
          { coords: [0, 0] }
        ],
        third: { coords: [window.innerWidth / 2, window.innerHeight / 2] }
      },
      onRest: val => console.log('on rest was called with ', val)
    },
    { coords: [0, 0] }
  )

  // React.useEffect(() => {
  //   window.addEventListener('mousemove', ({ pageX, pageY }) => {
  //     setTrail({ to: { coords: [pageX, pageY] } })
  //   })
  //   // return window.removeEventListener('mousemove', handleMouseMove)
  // }, [])

  return (
    <React.Fragment>
      <button
        onClick={() =>
          (state === 'first' ? setState('second') : setState('first'))}
      >
        toggle
      </button>
      <ul>
        {renderedItems.map(({ item, style }, idx) => {
          return (
            <animated.li
              key={idx}
              style={{
                background: colors[idx],
                zIndex: 100 - idx,
                height: '100px',
                position: 'absolute',
                width: '100px',
                display: 'flex',
                alignItems: 'center',
                willChange: 'transform',
                justifyContent: 'center',
                borderRadius: '50%',
                boxShadow: '0px 5px 25px -10px rgba(0, 0, 0, 0.2)',
                fontWeight: 'bold',
                fontSize: '30px',
                color: 'white',
                transform: style.coords.interpolate(
                  (x, y) => `translate3d(${x}px, ${y}px, 0)`
                )
              }}
            >
              {item}
            </animated.li>
          )
        })}
      </ul>
    </React.Fragment>
  )
}

testStories.add('Keyframes with trails primive ', () => <KeyframedTrail />)

function KeyframedSpring () {
  const [state, setState] = React.useState('first')
  const [style, setSpring] = useSpringKeyframes(
    {
      state,
      states: {
        first: function (next) {
          next({ coords: [0, 600] })
            .then(() => next({ coords: [600, 600] }))
            .then(() => next({ coords: [600, 0] }, true))
        },
        second: [
          { coords: [600, 600] },
          { coords: [0, 600] },
          { coords: [0, 0] }
        ],
        third: { coords: [window.innerWidth / 2, window.innerHeight / 2] }
      },
      onRest: val => console.log('on rest was called with ', val)
    },
    { coords: [0, 0] }
  )

  return (
    <React.Fragment>
      <button
        onClick={() =>
          (state === 'first' ? setState('second') : setState('first'))}
      >
        toggle
      </button>
      <animated.div
        style={{
          background: 'black',
          height: '100px',
          position: 'absolute',
          width: '100px',
          display: 'flex',
          alignItems: 'center',
          willChange: 'transform',
          justifyContent: 'center',
          borderRadius: '50%',
          boxShadow: '0px 5px 25px -10px rgba(0, 0, 0, 0.2)',
          fontWeight: 'bold',
          fontSize: '30px',
          color: 'white',
          transform: style.coords.interpolate((x, y) => {
            return `translate3d(${x}px, ${y}px, 0)`
          })
        }}
      >
        1
      </animated.div>
    </React.Fragment>
  )
}
testStories.add('Keyframes with Spring primive ', () => <KeyframedSpring />)
