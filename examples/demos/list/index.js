import React, { Component } from 'react'
import List from './List'
import data from './data'
import './styles.css'
import shuffle from 'lodash/shuffle'

export default class App extends Component {
  state = { data }
  shuffle = () => this.setState(state => ({ data: shuffle(state.data) }))
  componentDidMount() {
    setInterval(this.shuffle, 3000)
  }
  render() {
    return (
      <List
        className="main-list"
        items={this.state.data}
        keys={d => d.name}
        heights={d => d.height}
        config={{ mass: 4, tension: 100, friction: 40 }}>
        {item => (
          <div className="main-list-cell">
            <div className="main-list-details" style={{ backgroundImage: item.css }}>
              <h1>{item.name}</h1>
              <p>{item.description}</p>
            </div>
          </div>
        )}
      </List>
    )
  }
}
