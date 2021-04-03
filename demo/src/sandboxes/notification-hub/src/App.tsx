import React, { useRef, useState, useEffect } from 'react'
import { loremIpsum } from 'lorem-ipsum'
import { X } from 'react-feather'
import { animated, useTransition } from 'react-spring'
import styles from './styles.module.css'

let id = 0

interface MessageHubProps {
  config?: {
    tension: number
    friction: number
    precision: number
  }
  timeout?: number
  children: (add: AddFunction) => void
}

type AddFunction = (msg: string) => void

interface Item {
  key: number
  msg: string
}

function MessageHub({
  config = { tension: 125, friction: 20, precision: 0.1 },
  timeout = 3000,
  children,
}: MessageHubProps) {
  const [refMap] = useState(() => new WeakMap())
  const [cancelMap] = useState(() => new WeakMap())
  const [items, setItems] = useState<Item[]>([])

  const transitions = useTransition(items, {
    from: { opacity: 0, height: 0, life: '100%' },
    keys: (item: Item) => item.key,
    enter: item => async next => await next({ opacity: 1, height: refMap.get(item).offsetHeight }),
    leave: item => async (next, cancel) => {
      cancelMap.set(item, cancel)
      await next({ life: '0%' })
      await next({ opacity: 0 })
      await next({ height: 0 })
    },
    onRest: (_, item) => {
      setItems(state =>
        state.filter(i => {
          /**
           * It would be good to not have to Typecast this,
           * it should be able to infer this from the .item in controller
           */
          return i.key !== (item as Item).key
        })
      )
    },
    // config: (item, state) => (state === 'leave' ? [{ duration: timeout }, config, config] : config),
  })

  useEffect(() => {
    children((msg: string) => {
      setItems(state => [...state, { key: id++, msg }])
    })
  }, [])

  return (
    <div className={styles.container}>
      {transitions(({ life, ...style }, item) => (
        <animated.div className={styles.message} style={style}>
          <div className={styles.content} ref={ref => ref && refMap.set(item, ref)}>
            <animated.div className={styles.life} style={{ right: life }} />
            <p>{item.msg}</p>
            <div
              className={styles.button}
              onClick={e => {
                e.stopPropagation()
                if (cancelMap.has(item)) {
                  cancelMap.get(item)()
                }
              }}>
              <X size={18} />
            </div>
          </div>
        </animated.div>
      ))}
    </div>
  )
}

export default function App() {
  const ref = useRef<null | AddFunction>(null)

  const handleClick = () => {
    if (ref.current) {
      ref.current(loremIpsum())
    }
  }

  return (
    <div className={styles.main} onClick={handleClick}>
      Click here to create notifications
      <MessageHub
        children={(add: AddFunction) => {
          ref.current = add
        }}
      />
    </div>
  )
}
