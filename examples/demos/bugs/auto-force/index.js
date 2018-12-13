import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { Spring, animated, config as defaultConfig } from 'react-spring'
import { Accordion } from './Accordion'

/** A component that handles animating the height of an expandable element. */
class Expandable extends Component {
  render() {
    const { children, className, config, expanded, ...rest } = this.props
    return (
      <Spring
        force
        native
        from={{ height: 0 }}
        to={{ height: expanded ? 'auto' : 0 }}
        config={{ ...(config || defaultConfig.default), precision: 1 }}>
        {style => (
          <animated.div style={{ overflow: 'hidden', ...style }} {...rest}>
            {children}
          </animated.div>
        )}
      </Spring>
    )
  }
}

function App() {
  return (
    <Accordion>
      <Accordion.Item id="1">
        {({ contentProps, titleProps }) => (
          <React.Fragment>
            <h1 style={{ margin: '0 0 16px 0' }} {...titleProps}>
              Item 1
            </h1>
            <Expandable {...contentProps}>
              <Accordion style={{ backgroundColor: '#3fcbb994' }}>
                <Accordion.Item id="1">
                  {({ contentProps, titleProps }) => (
                    <React.Fragment>
                      <h1 style={{ margin: '0 0 16px 0' }} {...titleProps}>
                        SubItem 1
                      </h1>
                      <Expandable {...contentProps}>
                        Etsy stumptown aesthetic heirloom pabst deep v.
                        Wayfarers occupy knausgaard migas drinking vinegar.
                        8-bit gluten-free photo booth fixie small batch,
                        dreamcatcher pug forage banh mi ennui af retro slow-carb
                        kinfolk. Kombucha cliche kogi celiac, chicharrones PBR&B
                        freegan.
                      </Expandable>
                    </React.Fragment>
                  )}
                </Accordion.Item>
              </Accordion>
            </Expandable>
          </React.Fragment>
        )}
      </Accordion.Item>
      <Accordion.Item id="2">
        {({ contentProps, titleProps }) => (
          <React.Fragment>
            <h1 style={{ margin: '0 0 16px 0' }} {...titleProps}>
              Item 1
            </h1>
            <Expandable {...contentProps}>
              <Accordion style={{ backgroundColor: '#3fcbb994' }}>
                <Accordion.Item id="1">
                  {({ contentProps, titleProps }) => (
                    <React.Fragment>
                      <h1 style={{ margin: '0 0 16px 0' }} {...titleProps}>
                        SubItem 1
                      </h1>
                      <Expandable {...contentProps}>
                        Etsy stumptown aesthetic heirloom pabst deep v.
                        Wayfarers occupy knausgaard migas drinking vinegar.
                        8-bit gluten-free photo booth fixie small batch,
                        dreamcatcher pug forage banh mi ennui af retro slow-carb
                        kinfolk. Kombucha cliche kogi celiac, chicharrones PBR&B
                        freegan.
                      </Expandable>
                    </React.Fragment>
                  )}
                </Accordion.Item>
              </Accordion>
            </Expandable>
          </React.Fragment>
        )}
      </Accordion.Item>
    </Accordion>
  )
}

const rootElement = document.getElementById('root')
ReactDOM.render(<App />, rootElement)
