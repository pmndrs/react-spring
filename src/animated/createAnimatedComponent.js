import React from 'react'
import AnimatedProps from './AnimatedProps'
import { handleRef, shallowEqual } from '../shared/helpers'
import * as Globals from './Globals'

export default function createAnimatedComponent(Component) {
  class AnimatedComponent extends React.Component {
    static propTypes = {
      style(props, propName, componentName) {
        if (!Component.propTypes) return
      },
    }

    constructor(props) {
      super()
      this.attachProps(props)
    }

    componentWillUnmount() {
      this.propsAnimated && this.propsAnimated.detach()
    }

    setNativeProps(props) {
      const didUpdate = Globals.applyAnimatedValues.fn(this.node, props, this)
      if (didUpdate === false) this.forceUpdate()
    }

    // The system is best designed when setNativeProps is implemented. It is
    // able to avoid re-rendering and directly set the attributes that
    // changed. However, setNativeProps can only be implemented on leaf
    // native components. If you want to animate a composite component, you
    // need to re-render it. In this case, we have a fallback that uses
    // forceUpdate.
    callback = () => {
      if (this.node) {
        const didUpdate = Globals.applyAnimatedValues.fn(
          this.node,
          this.propsAnimated.getAnimatedValue(),
          this
        )
        if (didUpdate === false) this.forceUpdate()
      }
    }

    attachProps({ forwardRef, ...nextProps }) {
      const oldPropsAnimated = this.propsAnimated
      this.propsAnimated = new AnimatedProps(nextProps, this.callback)
      // When you call detach, it removes the element from the parent list
      // of children. If it goes to 0, then the parent also detaches itself
      // and so on.
      // An optimization is to attach the new elements and THEN detach the old
      // ones instead of detaching and THEN attaching.
      // This way the intermediate state isn't to go to 0 and trigger
      // this expensive recursive detaching to then re-attach everything on
      // the very next operation.
      oldPropsAnimated && oldPropsAnimated.detach()
    }

    shouldComponentUpdate(props) {
      const { style, ...nextProps } = props
      const { style: currentStyle, ...currentProps } = this.props
      if (
        !shallowEqual(currentProps, nextProps) ||
        !shallowEqual(currentStyle, style)
      ) {
        this.attachProps(props)
        return true
      }
      return false
    }

    render() {
      const forwardRef = this.props.forwardRef
      const {
        scrollTop,
        scrollLeft,
        ...animatedProps
      } = this.propsAnimated.getValue()
      return (
        <Component
          {...animatedProps}
          ref={node => (this.node = handleRef(node, this.props.forwardRef))}
        />
      )
    }
  }
  return React.forwardRef((props, ref) => (
    <AnimatedComponent {...props} forwardRef={ref} />
  ))
}
