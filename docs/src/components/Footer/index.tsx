import React from 'react'
import styled from 'styled-components'

export default function Footer() {
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
  width: 100%;
  min-height: 300px;
  background: #202020;
  margin-top: 40px;
  padding-top: 30px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;

  a {
    color: #ccc;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }

  ul {
    list-style: none;
    margin-top: 26px;
    li {
      display: inline;
      margin: 0 5px;
    }
  }
`
