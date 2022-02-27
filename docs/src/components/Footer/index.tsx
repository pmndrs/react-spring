import React from 'react'
import styled from 'styled-components'

export const Footer = () => {
  return (
    <Container>
      <Cap />
      <div>
        <h1>✌️</h1>
        <ul>
          <li>
            <a
              target="_blank"
              rel="nofollow noopener noreferrer"
              href="https://github.com/react-spring/react-spring">
              github
            </a>
          </li>
          <li>
            <a
              target="_blank"
              rel="nofollow noopener noreferrer"
              href="https://www.npmjs.com/package/react-spring">
              npm
            </a>
          </li>
          <li>
            <a
              target="_blank"
              rel="nofollow noopener noreferrer"
              href="https://github.com/react-spring/react-spring/issues">
              contact
            </a>
          </li>
        </ul>
      </div>
    </Container>
  )
}

const Cap = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 30px;
  background: #fff;
  border-radius: 0 0 20px 20px;
`
const Container = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 300px;
  text-align: center;

  background: ${props => props.theme.colors.grey};
  margin-top: ${props => props.theme.margin['40']};
  padding-top: ${props => props.theme.padding['25']};

  a {
    color: ${props => props.theme.colors.offWhite};

    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  ul {
    list-style: none;
    margin-top: ${props => props.theme.margin['20']};

    li {
      display: inline;
      margin: ${props => `0 ${props.theme.margin['5']}`};
    }
  }
`
