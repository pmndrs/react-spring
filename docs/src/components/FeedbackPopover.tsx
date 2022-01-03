import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { animated, useSpring } from '@react-spring/web'
import styled from 'styled-components'

export const FeedbackPopover = () => {
  const { pathname } = useRouter()

  const [styles, api] = useSpring(() => ({
    from: {
      y: '110%',
    },
  }))

  useEffect(() => {
    api.start({
      to: {
        y: '0',
      },
      delay: 800,
    })
  }, [pathname])

  const handleClose = () =>
    api.start({
      to: {
        y: '110%',
      },
    })

  return (
    <Popover style={styles}>
      <PopoverContent>
        <PopoverCloseButton aria-label="Close popover" onClick={handleClose}>
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
              fill="currentColor"
              fill-rule="evenodd"
              clip-rule="evenodd"></path>
          </svg>
        </PopoverCloseButton>
        <PopoverTitle>Struggling to find what you want?</PopoverTitle>
        <PopoverCopy>
          {`We're interested in hearing your feedback for our documentation! Have your voice heard by commenting in this `}
          <a href="https://github.com/pmndrs/react-spring/issues/1799">issue</a>
        </PopoverCopy>
      </PopoverContent>
    </Popover>
  )
}

const Popover = styled(animated.div)`
  position: fixed;
  bottom: 0;
  right: 12px;
  padding: 24px 32px 32px;
  border-top-right-radius: 8px;
  border-top-left-radius: 8px;
  background: ${props => props.theme.colors.steel};
  color: ${props => props.theme.colors.white};
  width: 360px;
  box-shadow: 0px -2px 15px 2px rgba(0, 0, 0, 0.5);
`

const PopoverContent = styled.div`
  position: relative;
  padding-top: 12px;
`

const PopoverTitle = styled.h2`
  font-size: ${props => props.theme.fontSizes['XS']};
  font-weight: 500;
  margin-bottom: 12px;
  letter-spacing: 0.02em;
`

const PopoverCopy = styled.p`
  font-size: ${props => props.theme.fontSizes['XS']};
  line-height: ${props => props.theme.lineHeights['XS']};
  letter-spacing: 0.02em;

  & > a {
    font-weight: 500;
    text-decoration: ${props => `underline ${props.theme.colors.red}`};
  }

  & > a:visited {
    color: inherit;
  }
`

const PopoverCloseButton = styled.button`
  color: ${props => props.theme.colors.white};
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  margin: 0;
  height: 40px;
  width: 40px;
  position: absolute;
  right: -18px;
  top: -16px;
`
