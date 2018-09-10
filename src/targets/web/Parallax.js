import React from 'react'
import PropTypes from 'prop-types'
import controller from '../../animated/AnimatedController'
import AnimatedValue from '../../animated/AnimatedValue'
import createAnimatedComponent from '../../animated/createAnimatedComponent'
import SpringAnimation from '../../animated/SpringAnimation'
import { config } from '../shared/constants'

const AnimatedDiv = createAnimatedComponent('div')
const { Provider, Consumer } = React.createContext(null)

function getScrollType(horizontal) {
  return horizontal ? 'scrollLeft' : 'scrollTop'
}

const START_TRANSLATE_3D = 'translate3d(0px,0px,0px)'
const START_TRANSLATE = 'translate(0px,0px)'

export class ParallaxLayer extends React.PureComponent {
  static propTypes = {
    /** Size of a page, (1=100%, 1.5=1 and 1/5, ...) */
    factor: PropTypes.number,
    /** Determines where the layer will be at when scrolled to (0=start, 1=1st page, ...) */
    offset: PropTypes.number,
    /** shifts the layer in accordance to its offset, values can be positive or negative */
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
    const offset = height * this.props.offset + targetScroll * this.props.speed
    const to = parseFloat(-(scrollTop * this.props.speed) + offset)
    if (!immediate)
      controller(this.animatedTranslate, { to, ...config }, impl).start()
    else this.animatedTranslate.setValue(to)
  }

  setHeight(height, immediate = false) {
    const { config, impl } = this.parent.props
    const to = parseFloat(height * this.props.factor)
    if (!immediate)
      controller(this.animatedSpace, { to, ...config }, impl).start()
    else this.animatedSpace.setValue(to)
  }

  initialize() {
    const props = this.props
    const parent = this.parent
    const targetScroll = Math.floor(props.offset) * parent.space
    const offset = parent.space * props.offset + targetScroll * props.speed
    const to = parseFloat(-(parent.current * props.speed) + offset)
    this.animatedTranslate = new AnimatedValue(to)
    this.animatedSpace = new AnimatedValue(parent.space * props.factor)
  }

  renderLayer() {
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
      range: [0, 1],
      output: horizontal
        ? [START_TRANSLATE_3D, 'translate3d(1px,0,0)']
        : [START_TRANSLATE_3D, 'translate3d(0,1px,0)'],
    })
    return (
      <AnimatedDiv
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
        }}>
        {children}
      </AnimatedDiv>
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
          return this.renderLayer()
        }}
      </Consumer>
    )
  }
}

export default class Parallax extends React.PureComponent {
  // TODO keep until major release
  static Layer = ParallaxLayer

  static propTypes = {
    /** Determines the total space of the inner content where each page takes 100% of the visible container */
    pages: PropTypes.number.isRequired,
    /** Spring config (optional) */
    config: PropTypes.object,
    /** Allow content to be scrolled, or not */
    scrolling: PropTypes.bool,
    /** Scrolls horizontally or vertically */
    horizontal: PropTypes.bool,
    /** Spring implementation (optional) */
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
    this.animatedScroll = new AnimatedValue(target[scrollType])
    this.animatedScroll.addListener(({ value }) => (target[scrollType] = value))
    controller(
      this.animatedScroll,
      { to: offset * this.space, ...config },
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
          WebkitTransform: START_TRANSLATE,
          MsTransform: START_TRANSLATE,
          transform: START_TRANSLATE_3D,
          ...style,
        }}
        className={className}>
        {this.state.ready && (
          <div
            ref={node => (this.content = node)}
            style={{
              position: 'absolute',
              [horizontal ? 'height' : 'width']: '100%',
              WebkitTransform: START_TRANSLATE,
              MsTransform: START_TRANSLATE,
              transform: START_TRANSLATE_3D,
              overflow: 'hidden',
              [horizontal ? 'width' : 'height']: this.space * pages,
              ...innerStyle,
            }}>
            <Provider value={this}>{children}</Provider>
          </div>
        )}
      </div>
    )
  }
}
