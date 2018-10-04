import React from 'react'
import AnimatedProps from './AnimatedProps'
import * as Globals from './Globals'

export default function createAnimatedComponent(Component) {
  class AnimatedComponent extends React.Component {
    static propTypes = {
      style(props, propName, componentName) {
        if (!Component.propTypes) return
      },
    }

    componentWillUnmount() {
      this._propsAnimated && this._propsAnimated.__detach()
    }

    setNativeProps(props) {
      const didUpdate = Globals.applyAnimatedValues.fn(this.node, props, this)
      if (didUpdate === false) this.forceUpdate()
    }

    componentWillMount() {
      this.attachProps(this.props)
    }

    attachProps({ forwardRef, ...nextProps }) {
      const oldPropsAnimated = this._propsAnimated

      // The system is best designed when setNativeProps is implemented. It is
      // able to avoid re-rendering and directly set the attributes that
      // changed. However, setNativeProps can only be implemented on leaf
      // native components. If you want to animate a composite component, you
      // need to re-render it. In this case, we have a fallback that uses
      // forceUpdate.
      const callback = () => {
        if (this.node) {
          const didUpdate = Globals.applyAnimatedValues.fn(
            this.node,
            this._propsAnimated.__getAnimatedValue(),
            this
          )
          if (didUpdate === false) this.forceUpdate()
        }
      }

      this._propsAnimated = new AnimatedProps(nextProps, callback)

      // When you call detach, it removes the element from the parent list
      // of children. If it goes to 0, then the parent also detaches itself
      // and so on.
      // An optimization is to attach the new elements and THEN detach the old
      // ones instead of detaching and THEN attaching.
      // This way the intermediate state isn't to go to 0 and trigger
      // this expensive recursive detaching to then re-attach everything on
      // the very next operation.
      oldPropsAnimated && oldPropsAnimated.__detach()
    }

    componentWillReceiveProps(nextProps) {
      this.attachProps(nextProps)
    }

    render() {
      const forwardRef = this.props.forwardRef
      const {
        scrollTop,
        scrollLeft,
        ...animatedProps
      } = this._propsAnimated.__getValue()
      return (
        <Component
          {...animatedProps}
          ref={node => {
            this.node = node
            const forwardRef = this.props.forwardRef
            if (forwardRef) {
              // If it's a function, assume it's a ref callback
              if (typeof forwardRef === 'function') forwardRef(node)
              // If it's an object and has a 'current' property, assume it's a ref object
              else if (typeof forwardRef === 'object') forwardRef.current = node
            }
          }}
        />
      )
    }
  }
  return React.forwardRef((props, ref) => (
    <AnimatedComponent {...props} forwardRef={ref} />
  ))
}
