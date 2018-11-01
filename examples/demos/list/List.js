import React from 'react'
import PropTypes from 'prop-types'
import { Transition, animated } from 'react-spring'

const styles = {
  outer: { position: 'relative', width: '100%', height: '100%' },
  cell: { position: 'absolute', willChange: 'transform, height, opacity', width: '100%' }
}

export default class List extends React.Component {
  static propTypes = {
    items: PropTypes.array,
    keys: PropTypes.func,
    heights: PropTypes.oneOfType([PropTypes.func, PropTypes.number])
  }
  static defaultProps = { heights: 400 }

  render() {
    let { children, config, items, keys, heights, ...rest } = this.props
    let totalHeight = 0
    let displayData = items.map(child => {
      let y = totalHeight
      let height = typeof heights === 'function' ? heights(child) : heights
      totalHeight += height
      return { y, height, key: keys(child), child }
    })
    return (
      <div style={{ ...styles.outer, height: totalHeight }} {...rest}>
        <Transition
          native
          items={displayData}
          keys={d => d.key}
          initial={null}
          from={{ height: 0, opacity: 0, scale: 1 }}
          leave={{ height: 0, opacity: 0 }}
          enter={({ y, height }) => ({ y, height, opacity: 1 })}
          update={({ y, height }) => ({ y, height, scale: 1 })}
          config={config}
          trail={100}>
          {({ child }, s, i) => ({ opacity, y, height }) => (
            <animated.div
              style={{
                ...styles.cell,
                opacity,
                height,
                zIndex: displayData.length - i,
                transform: y.interpolate(y => `translate3d(0,${y}px, 0)`)
              }}
              children={children(child)}
            />
          )}
        </Transition>
      </div>
    )
  }
}
