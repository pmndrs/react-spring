import React from 'react'
import styled from 'styled-components'
import ScrollPercentage from 'react-scroll-percentage'
import clsx from 'clsx'

export const ScrollIndicator = () => {
  return (
    <ScrollPercentage>
      {({ percentage }) => {
        const classes = clsx({
          'can-fade': true,
          'is-hidden': percentage > 0.2,
        })
        return (
          <Container>
            <ArrowContainer className={classes}>
              <ArrowAnimationWrapper>
                <svg
                  height="37"
                  viewBox="0 0 24 37"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg">
                  <g
                    fill="none"
                    fillRule="evenodd"
                    stroke="#000"
                    strokeLinecap="square"
                    strokeWidth="2.8"
                    transform="translate(2 1)">
                    <path
                      d="m2.82418338 30.8044364 13.57954542-.0568182.0568182-13.5795454"
                      transform="matrix(.70710678 .70710678 -.70710678 .70710678 19.785027 .20723)"
                    />
                    <path d="m9.54545455.45075758v30.65151512" />
                  </g>
                </svg>
              </ArrowAnimationWrapper>
            </ArrowContainer>
            <LabelContainer className={classes}>
              <Label>
                get
                <br />
                started
              </Label>
            </LabelContainer>
          </Container>
        )
      }}
    </ScrollPercentage>
  )
}

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100px;

  & > .can-fade {
    transition: opacity 250ms ease-in-out;
  }
  & > .is-hidden {
    opacity: 0;
  }
`

const ArrowContainer = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
`

const ArrowAnimationWrapper = styled.div`
  @keyframes bounce {
    0%,
    20%,
    50%,
    80%,
    100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-15px);
    }
    60% {
      transform: translateY(-5px);
    }
  }

  animation-name: bounce;
  animation-duration: 1.8s;
  animation-iteration-count: 3;
`

const LabelContainer = styled.div`
  position: absolute;
  width: 50%;
  height: 100%;
  padding-right: 60px;

  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-end;
`
const Label = styled.h3`
  font-size: 20px;
  text-align: right;
  font-weight: 600;
  color: #000;
`
