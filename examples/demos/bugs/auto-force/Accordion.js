import React, { Component, createContext } from 'react'
import PropTypes from 'prop-types'
const { Provider, Consumer } = createContext()

const basicArrayEquals = (arr1 = [], arr2 = []) =>
  arr1.toString() === arr2.toString()

const AccordionItem = ({ children, id, render }) => (
  <Consumer>
    {({ contentRole, titleRole, expandedItems, toggle }) => {
      const expanded = expandedItems.includes(id)
      const toggleItem = () => {
        toggle(id)
      }
      return (children || render)({
        contentProps: {
          id: `item-content-${id}`,
          'aria-labelledby': `item-title-${id}`,
          expanded,
          role: contentRole
        },
        titleProps: {
          id: `item-title-${id}`,
          'aria-controls': `item-body-${id}`,
          'aria-expanded': `${expanded}`,
          expanded,
          onClick: toggleItem,
          onKeyDown: e => {
            if (e.keyCode === 32) {
              e.preventDefault()
              toggleItem()
            }
          },
          role: titleRole,
          tabIndex: '0'
        },
        expanded,
        toggle: toggleItem
      })
    }}
  </Consumer>
)

class Accordion extends Component {
  constructor(props) {
    super(props)

    this.state = {
      contentRole: props.allowMultiple ? 'tabpanel' : 'region',
      expandedItems: props.initialExpanded,
      titleRole: props.allowMultiple ? 'tab' : 'button',
      toggle: this.toggleItem
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (
      props.activeItems &&
      !basicArrayEquals(props.activeItems, state.expandedItems)
    ) {
      return { expandedItems: props.activeItems }
    }

    return {}
  }

  toggleItem = uuid => {
    this.setState(({ expandedItems }) => ({
      expandedItems: expandedItems.includes(uuid)
        ? expandedItems.filter(id => id !== uuid)
        : this.props.allowMultiple
          ? [...expandedItems, uuid]
          : [uuid]
    }))
  }

  render() {
    const { children, className, component, style } = this.props
    const Component = component
    return (
      <Component className={className} style={style}>
        <Provider value={this.state}>{children}</Provider>
      </Component>
    )
  }
}

Accordion.Item = AccordionItem

Accordion.defaultProps = {
  className: '',
  component: 'div',
  initialExpanded: [],
  style: null
}

export { Accordion }
