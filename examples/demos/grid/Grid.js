import React from 'react'
import PropTypes from 'prop-types'
import Measure from 'react-measure'
import { Transition, animated, interpolate } from 'react-spring'

export default class Grid extends React.Component {
  static propTypes = {
    occupySpace: PropTypes.bool,
    columns: PropTypes.number,
    margin: PropTypes.number,
    data: PropTypes.array,
    keys: PropTypes.func,
    heights: PropTypes.func,
  }
  static defaultProps = {
    occupySpace: true,
    columns: 3,
    margin: 0,
  }
  state = { width: 0, height: 0, active: undefined, lastActive: undefined }
  preventScroll = e => {
    if (!this.props.lockScroll) {
      this.state.active && this.onClick(undefined)
      this.clicked = false
    }
  }
  onClick = key =>
    this.setState(
      state => ({
        lastActive: state.active,
        active: state.active === key ? undefined : key,
      }),
      () => (this.clicked = true)
    )
  resizeOuter = props =>
    this.setState({
      widthOuter: props.client.width,
      heightOuter: props.client.height,
    })
  resizeInner = props =>
    this.setState({
      width: props.client.width,
      height: props.client.height,
    })
  update = ({ key, x, y, width, height }) => {
    const active = this.state.active === key
    return {
      opacity: this.state.active && !active ? 0 : 1,
      x: active ? this.outerRef.scrollLeft : x,
      y: active ? this.outerRef.scrollTop : y,
      width: active ? this.state.width : width,
      height: active ? this.state.heightOuter : height,
    }
  }

  componentDidUpdate() {
    this.clicked = false
  }

  render() {
    let {
      children,
      columns,
      margin,
      occupySpace,
      impl,
      config,
      data,
      keys,
      heights,
      inactiveDelay,
      lockScroll,
      ...rest
    } = this.props
    let { lastActive, active } = this.state
    let column = 0
    let columnHeights = new Array(columns).fill(0)

    let displayData = data.map((child, i) => {
      let index = occupySpace
        ? columnHeights.indexOf(Math.min(...columnHeights))
        : column++ % columns
      let width = this.state.width / columns - margin / (1 - 1 / (columns + 1))
      let left = width * index
      let offset = (index + 1) * margin
      let top = columnHeights[index] + margin
      let height = typeof heights === 'function' ? heights(child) : heights
      columnHeights[index] += height + margin
      return {
        x: margin ? left + offset : left,
        y: top,
        width,
        height,
        key: keys(child),
        object: child,
      }
    })
    return (
      <Measure
        client
        innerRef={r => (this.outerRef = r)}
        onResize={this.resizeOuter}>
        {({ measureRef }) => (
          <div
            ref={measureRef}
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              ...this.props.style,
              overflow: lockScroll ? (active ? 'hidden' : 'auto') : 'auto',
            }}
            {...rest}
            onScroll={this.preventScroll}
            onWheel={this.preventScroll}
            onTouchMove={this.preventScroll}>
            <Measure
              client
              innerRef={r => (this.innerRef = r)}
              onResize={this.resizeInner}>
              {({ measureRef }) => (
                <div
                  ref={measureRef}
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: Math.max(...columnHeights) + margin,
                  }}>
                  <Transition
                    native
                    delay={this.clicked && !active ? inactiveDelay : 0}
                    items={displayData}
                    keys={d => d.key}
                    from={{ opacity: 0 }}
                    leave={{ opacity: 0 }}
                    enter={this.update}
                    update={this.update}
                    impl={impl}
                    config={config}>
                    {displayData.map(
                      (child, i) => ({ opacity, x, y, width, height }) => {
                        const key = child.key
                        return (
                          <animated.div
                            style={{
                              opacity,
                              width: width,
                              height: height,
                              position: 'absolute',
                              willChange: 'transform, width, height, opacity',
                              zIndex:
                                lastActive === key || active === key ? 1000 : i,
                              transform: interpolate(
                                [x, y],
                                (x, y) => `translate3d(${x}px,${y}px, 0)`
                              ),
                            }}
                            children={children(
                              child.object,
                              active === key,
                              () => this.onClick(key)
                            )}
                          />
                        )
                      }
                    )}
                  </Transition>
                </div>
              )}
            </Measure>
          </div>
        )}
      </Measure>
    )
  }
}
