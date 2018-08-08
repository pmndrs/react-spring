// Inspired by Corey Haggards "Screeners"
// https://dribbble.com/shots/4138489-Screeners

import React from 'react'
import { Parallax, ParallaxLayer } from 'react-spring'
import './styles.css'

const Page = ({ offset, caption, first, second, gradient, onClick }) => (
  <React.Fragment>
    <ParallaxLayer offset={offset} speed={0.2} onClick={onClick}>
      <div className="slopeBegin" />
    </ParallaxLayer>

    <ParallaxLayer offset={offset} speed={-0.2} onClick={onClick}>
      <div className={`slopeEnd ${gradient}`} />
    </ParallaxLayer>

    <ParallaxLayer className="text number" offset={offset} speed={0.3}>
      <span>0{offset + 1}</span>
    </ParallaxLayer>
  </React.Fragment>
)

export default class extends React.Component {
  scroll = to => this.parallax.scrollTo(to)
  render() {
    return (
      <div style={{ background: '#dfdfdf' }}>
        <Parallax
          className="container"
          ref={node => (this.parallax = node)}
          pages={3}
          horizontal
          scrolling={false}>
          <Page
            offset={0}
            gradient="pink"
            caption="who we are"
            first="Lorem ipsum"
            second="dolor sit"
            onClick={() => this.scroll(1)}
          />
          <Page
            offset={1}
            gradient="teal"
            caption="what we do"
            first="consectetur"
            second="adipiscing elit"
            onClick={() => this.scroll(2)}
          />
          <Page
            offset={2}
            gradient="tomato"
            caption="what we want"
            first="Morbi quis"
            second="est dignissim"
            onClick={() => this.scroll(0)}
          />
        </Parallax>
      </div>
    )
  }
}
