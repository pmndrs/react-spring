import React from 'react'
import PropTypes from 'prop-types'
import Measure from 'react-measure'
import { Transition, animated, interpolate } from 'react-spring'

const styles = {
  outer: { position: 'relative', width: '100%', height: '100%' },
  inner: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    minHeight: '100%',
  },
  cell: {
    position: 'absolute',
    willChange: 'transform, width, height, opacity',
  },
}

export default class Grid extends React.Component {
  static propTypes = {
    data: PropTypes.array,
    keys: PropTypes.func,
    occupySpace: PropTypes.bool,
    columns: PropTypes.number,
    margin: PropTypes.number,
    heights: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
    lockScroll: PropTypes.bool,
    closeDelay: PropTypes.number,
  }
  static defaultProps = {
    occupySpace: true,
    columns: 3,
    margin: 0,
    heights: 400,
    lockScroll: false,
    closeDelay: 0,
  }
  state = { width: 0, height: 0, open: undefined, lastOpen: undefined }
  scrollOut = e => {
    if (!this.props.lockScroll) {
      this.state.open && this.toggle(undefined)
      this.clicked = false
    }
  }
  toggle = key =>
    this.setState(
      state => ({
        lastOpen: state.open,
        open: state.open === key ? undefined : key,
      }),
      () => (this.clicked = true)
    )
  resize = (width, height, props) =>
    this.setState({
      [width]: props.client.width,
      [height]: props.client.height,
    })
  resizeOuter = props => this.resize('widthOuter', 'heightOuter', props)
  resizeInner = props => this.resize('width', 'height', props)
  update = ({ key, x, y, width, height }) => {
    const open = this.state.open === key
    return {
      opacity: this.state.open && !open ? 0 : 1,
      x: open ? this.outerRef.scrollLeft : x,
      y: open ? this.outerRef.scrollTop : y,
      width: open ? this.state.width : width,
      height: open ? this.state.heightOuter : height,
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
      closeDelay,
      lockScroll,
      ...rest
    } = this.props
    let { lastOpen, open, width } = this.state
    let column = 0
    let columnHeights = new Array(columns).fill(0)

    let displayData = data.map((child, i) => {
      let index = occupySpace
        ? columnHeights.indexOf(Math.min(...columnHeights))
        : column++ % columns
      let cellWidth = width / columns - margin / (1 - 1 / (columns + 1))
      let left = cellWidth * index
      let offset = (index + 1) * margin
      let top = columnHeights[index] + margin
      let height = typeof heights === 'function' ? heights(child) : heights
      columnHeights[index] += height + margin
      return {
        x: margin ? left + offset : left,
        y: top,
        width: cellWidth,
        height,
        key: keys(child),
        object: child,
      }
    })
    const overflow = lockScroll ? (open ? 'hidden' : 'auto') : 'auto'
    const height = Math.max(...columnHeights) + margin
    return (
      <Measure
        client
        innerRef={r => (this.outerRef = r)}
        onResize={this.resizeOuter}>
        {({ measureRef }) => (
          <div
            ref={measureRef}
            style={{ ...styles.outer, ...this.props.style, overflow }}
            {...rest}
            onScroll={this.scrollOut}
            onWheel={this.scrollOut}
            onTouchMove={this.scrollOut}>
            <Measure
              client
              innerRef={r => (this.innerRef = r)}
              onResize={this.resizeInner}>
              {({ measureRef }) => (
                <div ref={measureRef} style={{ ...styles.inner, height }}>
                  <Transition
                    native
                    items={displayData}
                    keys={d => d.key}
                    from={{ opacity: 0 }}
                    leave={{ opacity: 0 }}
                    enter={this.update}
                    update={this.update}
                    impl={impl}
                    config={{
                      ...config,
                      delay: this.clicked && !open ? closeDelay : 0,
                    }}>
                    {(c, i) => ({ opacity, x, y, width, height }) => (
                      <animated.div
                        style={{
                          ...styles.cell,
                          opacity,
                          width,
                          height,
                          zIndex:
                            lastOpen === c.key || open === c.key ? 1000 : i,
                          transform: interpolate(
                            [x, y],
                            (x, y) => `translate3d(${x}px,${y}px, 0)`
                          ),
                        }}
                        children={children(c.object, open === c.key, () =>
                          this.toggle(c.key)
                        )}
                      />
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
