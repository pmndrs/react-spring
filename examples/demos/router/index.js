import React from 'react'
import { Transition, animated } from 'react-spring'
import {
  HashRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from 'react-router-dom'
import './styles.css'

const App = () => (
  <Router>
    <Route
      render={({ location, ...rest }) => (
        <div className="fill">
          <Route exact path="/" render={() => <Redirect to="/red" />} />
          <ul className="nav">
            <NavLink to="/red">Red</NavLink>
            <NavLink to="/green">Green</NavLink>
          </ul>
          <div className="content">
            <Transition
              native
              items={location}
              keys={location.pathname.split('/')[1]}
              from={{ transform: 'translateY(100px)', opacity: 0 }}
              enter={{ transform: 'translateY(0px)', opacity: 1 }}
              leave={{ transform: 'translateY(100px)', opacity: 0 }}>
              {(loc, state) => style => (
                <Switch location={state === 'update' ? location : loc}>
                  <Route
                    path="/red"
                    render={props => Red({ ...props, style })}
                  />
                  <Route
                    path="/green"
                    render={props => Green({ ...props, style })}
                  />
                  <Route render={() => <div>Not Found</div>} />
                </Switch>
              )}
            </Transition>
          </div>
        </div>
      )}
    />
  </Router>
)

const NavLink = props => (
  <li className="navItem">
    <Link {...props} style={{ cursor: 'pointer', color: 'inherit' }} />
  </li>
)

const Red = ({ style }) => (
  <animated.div
    className="mainRoute"
    style={{ ...style, background: `#ef5350` }}>
    <div className="mainRouteItem">
      <p>Red</p>
      <NavLink to="/red/ultra">Ultra Red</NavLink>
    </div>
    <Route
      render={({ location }) => (
        <div>
          <Transition
            native
  
            items={location}
            keys={location.pathname}
            from={{ transform: 'translateY(100px)', opacity: 0 }}
            enter={{ transform: 'translateY(0px)', opacity: 1 }}
            leave={{ transform: 'translateY(100px)', opacity: 0 }}>
            {(loc, state) => style => (
              <Switch location={loc}>
                <Route
                  exact
                  path="/red/ultra"
                  render={props => UltraRed({ ...props, style })}
                />
              </Switch>
            )}
          </Transition>
        </div>
      )}
    />
  </animated.div>
)

const UltraRed = ({ style }) => (
  <animated.div
    className="subRoute"
    style={{ ...style, background: '#d32f2f' }}>
    Ultra Red
  </animated.div>
)

const Green = ({ style }) => (
  <animated.div
    className="mainRoute"
    style={{ ...style, background: `#4CAF50` }}>
    <div className="mainRouteItem">
      <p>Green</p>
      <NavLink to="/green/ultra">Ultra Green</NavLink>
    </div>
    <Route
      render={({ location }) => (
        <div>
          <Transition
            native
            items={location}
            keys={location.pathname}
            from={{ transform: 'translateY(100px)', opacity: 0 }}
            enter={{ transform: 'translateY(0px)', opacity: 1 }}
            leave={{ transform: 'translateY(100px)', opacity: 0 }}>
            {loc => style => (
              <Switch location={loc}>
                <Route
                  exact
                  path="/green/ultra"
                  render={props => UltraGreen({ ...props, style })}
                />
              </Switch>
            )}
          </Transition>
        </div>
      )}
    />
  </animated.div>
)

const UltraGreen = ({ match: { params }, style }) => (
  <animated.div
    className="subRoute"
    style={{ ...style, background: `#388E3C` }}>
    Ultra Green
  </animated.div>
)

export default App
