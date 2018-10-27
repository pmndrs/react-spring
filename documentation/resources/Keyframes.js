import React from 'react'
import PropTypes from 'prop-types'

const DEFAULT = '__default'
export default class Keyframes extends React.Component {
  static propTypes = {
    /** Name of the active slot */
    state: PropTypes.string,
  }
  static defaultProps = { state: DEFAULT }
  render() {
    return null
  }
}