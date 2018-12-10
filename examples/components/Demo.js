import React from 'react'
import Loadable from 'react-loadable'
import styled from 'styled-components'

export default class Demo extends React.Component {
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

  render() {
    const { title, description, tags, link } = this.props
    return (
      <Container>
        <Header>
          <h1>{title}</h1>
          <p>
            Source:{' '}
            <a target="_blank" href={link}>
              {link.slice(link.lastIndexOf('/'))}
            </a>
          </p>
          {description && <p>{description}</p>}
          {tags && (
            <p>
              {tags.map(tag => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </p>
          )}
        </Header>
        <Content>
          <div>
            <this.component />
          </div>
        </Content>
      </Container>
    )
  }
}

const Tag = styled('span')`
  padding: 5px;
  background: #9f9f9f;
  border-radius: 5px;
  margin-right: 5px;
  text-transform: uppercase;
  font-size: 0.6em;
  color: white;
`

const Container = styled('div')`
  position: relative;
  width: 100%;
  height: 400px;
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

const Content = styled('div')`
  position: relative;
  height: 100%;
  overflow: hidden;

  & > div {
    position: relative;
    height: 100%;
    overflow: hidden auto;
    border-radius: 7px;
    background: #f0f0f0;
  }
`
