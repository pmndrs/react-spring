import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useTransition, useChain, config, animated } from 'react-spring'
import shuffle from 'lodash-es/shuffle'
import flatten from 'lodash-es/flatten'
import './styles.css'

export default function Container() {
  const [items, setItems] = useState(new Array(10).fill().map((_, i) => i))
  const [visible, setVisible] = useState(false)
  const shuffleItems = useMemo(() => () => setItems(shuffle), items.length)
  const addItem = useMemo(
    () => () => setItems(items => [...items, Math.max(...items) + 1]),
    items.length
  )
  const removeItem = useMemo(
    () => id => setItems(items => items.filter(item => item !== id)),
    items.length
  )
  const toggle = useMemo(
    () => () =>
      setVisible(
        state => console.log('---container SETTING STATE TO', !state) || !state
      ),
    items.length
  )

  return (
    <div className="fts-p-4">
      <div>
        <div>
          <button className="fts-btn" onClick={toggle}>
            toggle
          </button>
          {visible && (
            <>
              <button className="fts-btn fts-fade-in" onClick={addItem}>
                add
              </button>
              <button className="fts-btn fts-fade-in" onClick={shuffleItems}>
                shuffle
              </button>
            </>
          )}
        </div>
      </div>
      <div>
        <TransitionGrid
          items={items}
          visible={visible}
          removeItem={removeItem}
        />
      </div>
    </div>
  )
}

const TransitionGrid = ({ visible, items, removeItem }) => {
  const containerRef = useRef()
  const containerTransition = useTransition(visible, null, {
    config: { ...config.stiff, precision: 0.01 },
    from: { opacity: 0, x: -500 },
    enter: { opacity: 1, x: 0 },
    leave: { opacity: 0, x: 500 },
    ref: containerRef,
    //unique: true,
    //reset: true,
  })

  const itemsRef = useRef()
  const itemsTransition = useTransition(visible ? items : [], null, {
    config: { ...config.stiff, precision: 0.01, cancelDelay: false },
    from: { opacity: 0, scale: 0 },
    enter: { opacity: 1, scale: 1 },
    leave: { opacity: 0, scale: 0 },
    trail: 400 / items.length,
    ref: itemsRef,
    unique: true,
    reset: true,
  })

  useEffect(() => {
    containerRef.current.name = 'container'
    itemsRef.current.name = 'items'
  })

  useEffect(
    () =>
      void ((containerRef.current.name = 'container'),
      (itemsRef.current.name = 'items'))
  )

  const chain = [containerRef, itemsRef]
  useChain(visible ? chain : chain.reverse(), [0, visible ? 0.1 : 0.6])

  return (
    <div>
      {containerTransition.map(
        ({ item, key, props: { x, opacity } }) =>
          item && (
            <animated.div
              key={key}
              style={{
                position: 'absolute',
                height: 200,
                width: '100%',
                opacity,
                transform: x.interpolate(x => `translateX(${x}px)`),
              }}
              className="fts-grid fts-animated-grid">
              {itemsTransition.map(
                ({ item, key, props: { scale, opacity } }) => (
                  <animated.div
                    className="fts-card"
                    key={key}
                    style={{
                      opacity,
                      transform: scale.interpolate(s => `scale(${s})`),
                    }}
                    onClick={() => removeItem(item)}>
                    <div className="fts-close-card">&#x2715;</div>
                    <div>{item}</div>
                  </animated.div>
                )
              )}
            </animated.div>
          )
      )}
    </div>
  )
}
