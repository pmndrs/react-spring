import React from 'react'
import PropTypes from 'prop-types'
import createContext from 'create-react-context'
import Animated from './animated/targets/react-dom'
import SpringAnimation from './animated/SpringAnimation'
import { config, animated, template } from './Spring'

const { Provider, Consumer } = createContext(null)

function getScrollType(horizontal) {
  return horizontal ? 'scrollLeft' : 'scrollTop'
}

export default class Parallax extends React.PureComponent {
  static propTypes = {
    pages: PropTypes.number.isRequired,
    config: PropTypes.object,
    scrolling: PropTypes.bool,
    horizontal: PropTypes.bool,
    impl: PropTypes.func,
  }

  static defaultProps = {
    config: config.slow,
    scrolling: true,
    horizontal: false,
    impl: SpringAnimation,
  }

  state = { ready: false }
  layers = []
  space = 0
  current = 0
  offset = 0
  busy = false

  moveItems = () => {
    this.layers.forEach(layer => layer.setPosition(this.space, this.current))
    this.busy = false
  }

  scrollerRaf = () => requestAnimationFrame(this.moveItems)

  onScroll = event => {
    const { horizontal } = this.props
    if (!this.busy) {
      this.busy = true
      this.scrollerRaf()
      this.current = event.target[getScrollType(horizontal)]
    }
  }

  update = () => {
    const { scrolling, horizontal } = this.props
    const scrollType = getScrollType(horizontal)
    if (!this.container) return
    this.space = this.container[horizontal ? 'clientWidth' : 'clientHeight']
    if (scrolling) this.current = this.container[scrollType]
    else this.container[scrollType] = this.current = this.offset * this.space
    if (this.content)
      this.content.style[horizontal ? 'width' : 'height'] = `${this.space *
        this.props.pages}px`
    this.layers.forEach(layer => {
      layer.setHeight(this.space, true)
      layer.setPosition(this.space, this.current, true)
    })
  }

  updateRaf = () => {
    requestAnimationFrame(this.update)
    // Some browsers don't fire on maximize
    setTimeout(this.update, 150)
  }

  scrollStop = event =>
    this.animatedScroll && this.animatedScroll.stopAnimation()

  scrollTo(offset) {
    const { horizontal, config, impl } = this.props
    const scrollType = getScrollType(horizontal)
    this.scrollStop()
    this.offset = offset
    const target = this.container
    this.animatedScroll = new Animated.Value(target[scrollType])
    this.animatedScroll.addListener(({ value }) => (target[scrollType] = value))
    Animated.controller(
      this.animatedScroll,
      { toValue: offset * this.space, ...config },
      impl
    ).start()
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateRaf, false)
    this.update()
    this.setState({ ready: true })
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateRaf, false)
  }

  componentDidUpdate() {
    this.update()
  }

  render() {
    const {
      style,
      innerStyle,
      pages,
      className,
      scrolling,
      children,
      horizontal,
    } = this.props
    const overflow = scrolling ? 'scroll' : 'hidden'
    return (
      <div
        ref={node => (this.container = node)}
        onScroll={this.onScroll}
        onWheel={scrolling ? this.scrollStop : null}
        onTouchStart={scrolling ? this.scrollStop : null}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          overflow,
          overflowY: horizontal ? 'hidden' : overflow,
          overflowX: horizontal ? overflow : 'hidden',
          WebkitOverflowScrolling: 'touch',
          WebkitTransform: 'translate(0,0)',
          MsTransform: 'translate(0,0)',
          transform: 'translate3d(0,0,0)',
          ...style,
        }}
        className={className}
      >
        {this.state.ready && (
          <div
            ref={node => (this.content = node)}
            style={{
              position: 'absolute',
              [horizontal ? 'height' : 'width']: '100%',
              WebkitTransform: 'translate(0,0)',
              MsTransform: 'translate(0,0)',
              transform: 'translate3d(0,0,0)',
              overflow: 'hidden',
              [horizontal ? 'width' : 'height']: this.space * pages,
              ...innerStyle,
            }}
          >
            <Provider value={this}>{children}</Provider>
          </div>
        )}
      </div>
    )
  }

  static Layer = class extends React.PureComponent {
    static propTypes = {
      factor: PropTypes.number,
      offset: PropTypes.number,
      speed: PropTypes.number,
    }

    static defaultProps = {
      factor: 1,
      offset: 0,
      speed: 0,
    }

    componentDidMount() {
      const parent = this.parent
      if (parent) {
        parent.layers = parent.layers.concat(this)
        parent.update()
      }
    }

    componentWillUnmount() {
      const parent = this.parent
      if (parent) {
        parent.layers = parent.layers.filter(layer => layer !== this)
        parent.update()
      }
    }

    setPosition(height, scrollTop, immediate = false) {
      const { config, impl } = this.parent.props
      const targetScroll = Math.floor(this.props.offset) * height
      const offset =
        height * this.props.offset + targetScroll * this.props.speed
      const toValue = parseFloat(-(scrollTop * this.props.speed) + offset)
      if (!immediate)
        Animated.controller(
          this.animatedTranslate,
          { toValue, ...config },
          impl
        ).start()
      else this.animatedTranslate.setValue(toValue)
    }

    setHeight(height, immediate = false) {
      const { config, impl } = this.parent.props
      const toValue = parseFloat(height * this.props.factor)
      if (!immediate)
        Animated.controller(
          this.animatedSpace,
          { toValue, ...config },
          impl
        ).start()
      else this.animatedSpace.setValue(toValue)
    }

    initialize() {
      const props = this.props
      const parent = this.parent
      const targetScroll = Math.floor(props.offset) * parent.space
      const offset = parent.space * props.offset + targetScroll * props.speed
      const toValue = parseFloat(-(parent.current * props.speed) + offset)
      this.animatedTranslate = new Animated.Value(toValue)
      this.animatedSpace = new Animated.Value(parent.space * props.factor)
    }

    renderLayers() {
      const {
        style,
        children,
        offset,
        speed,
        factor,
        className,
        ...props
      } = this.props
      const horizontal = this.parent.props.horizontal
      const translate3d = this.animatedTranslate.interpolate({
        inputRange: [0, 1],
        outputRange: horizontal
          ? ['translate3d(0px,0,0)', 'translate3d(1px,0,0)']
          : ['translate3d(0,0px,0)', 'translate3d(0,1px,0)'],
      })
      return (
        <animated.div
          {...props}
          className={className}
          style={{
            position: 'absolute',
            backgroundSize: 'auto',
            backgroundRepeat: 'no-repeat',
            willChange: 'transform',
            [horizontal ? 'height' : 'width']: '100%',
            [horizontal ? 'width' : 'height']: this.animatedSpace,
            WebkitTransform: translate3d,
            MsTransform: translate3d,
            transform: translate3d,
            ...style,
          }}
        >
          {children}
        </animated.div>
      )
    }

    render() {
      return (
        <Consumer>
          {parent => {
            if (parent && !this.parent) {
              this.parent = parent
              this.initialize()
            }

            return this.renderLayers()
          }}
        </Consumer>
      )
    }
  }
}
