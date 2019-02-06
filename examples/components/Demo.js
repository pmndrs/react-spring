import React from 'react'
import Loadable from 'react-loadable'
import styled from 'styled-components'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) return <h1>Something went wrong.</h1>
    return this.props.children
  }
}

export default class Demo extends React.Component {
  state = { code: undefined, visible: false }
  constructor(props) {
    super()
    this.component = Loadable({
      loader: () => props.import,
      loading: props => {
        if (props.error) console.error(props.error)
        return <div />
      },
    })
  }

  setVisible = visible => this.setState({ visible })

  enter = tag =>
    this.props.code &&
    this.props.code[tag] &&
    this.setState({ code: this.props.code[tag] })
  leave = tag => this.setState({ code: undefined })

  render() {
    const {
      title,
      description,
      tags,
      link,
      code,
      overlayCode = true,
      fullscreen = false,
    } = this.props
    return (
      <Container fullscreen={fullscreen}>
        <Header>
          <h1>{title}</h1>
          {link && (
            <p>
              {link.includes('codesandbox.io') ? 'Codesandbox' : 'Source'}:{' '}
              <a target="_blank" href={link}>
                {link.slice(link.lastIndexOf('/'))}
              </a>
            </p>
          )}
          {description && <p>{description}</p>}
          {tags && (
            <p>
              {tags.map(tag => (
                <Tag
                  key={tag}
                  children={tag}
                  onMouseEnter={() => this.enter(tag)}
                  onMouseLeave={() => this.leave(tag)}
                  style={{
                    background: code && code[tag] ? '#5f5f5f' : '#9f9f9f',
                  }}
                />
              ))}
            </p>
          )}
        </Header>
        <Content>
          <ErrorBoundary>
            <div>
              <this.component />
              {/*overlayCode && (
              <Spring
                native
                from={{ opacity: 0 }}
                to={{ opacity: this.state.code ? 1 : 0 }}>
                {props => <Code style={props} children={this.state.code} />}
              </Spring>
            )*/}
            </div>
          </ErrorBoundary>
        </Content>
      </Container>
    )
  }
}

const Container = styled('div')`
  position: relative;
  width: 100%;
  height: ${props => (props.fullscreen ? '100%' : '400px')};
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
`

const Header = styled('div')`
  margin-bottom: 10px;
  font-family: 'Chinese Quote', -apple-system, system-ui, 'Segoe UI',
    'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue',
    Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
    'Segoe UI Symbol';

  & > h1 {
    margin: 0 0 0.17em 0;
    text-transform: uppercase;
    color: rgba(0, 0, 0, 0.85);
    font-size: 13.6px;
    font-weight: 500;
    line-height: 19.9px;
  }

  & > p {
    margin: 0px 0 0.67em 0;
    font-size: 14px;
    line-height: 21px;
    color: rgba(0, 0, 0, 0.6);
  }

  & > p:first-of-type {
    margin: 0 0 0.67em 0;
    text-transform: uppercase;
    font-size: 0.6em;
    color: rgba(0, 0, 0, 0.4);
  }

  & > a {
    color: rgb(24, 144, 255);
    font-size: 14px;
    line-height: 21px;
    text-decoration: none;
  }
`

const Code = styled('pre' /*animated.pre*/)`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  font-size: 0.45em;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f0f0f0;
  margin: 0;
  padding: 0;
  pointer-events: none;
`

const Tag = styled('span')`
  padding: 5px;
  background: #9f9f9f;
  border-radius: 5px;
  margin-right: 5px;
  text-transform: uppercase;
  font-size: 0.6em;
  color: white;
  cursor: pointer;
`

const Content = styled('div')`
  position: relative;
  height: 100%;
  overflow: hidden;

  & > div {
    position: relative;
    height: 100%;
    overflow: hidden;
    border-radius: 7px;
    background: #f0f0f0;
  }
`
