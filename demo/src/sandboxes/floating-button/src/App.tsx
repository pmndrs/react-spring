import * as React from 'react'
import { useGesture } from '@use-gesture/react'
import { animated, useSpring, useSprings } from '@react-spring/web'

import { globalStyles } from './style/global'
import { styled } from './style/stitches.config'

const BUTTON_SIZE = 56

const COLORS = ['#669EF2', '#F9DB6D', '#DC602E', '#83BB70']

const App = () => {
  globalStyles()

  const buttonRef = React.useRef<HTMLDivElement>(null!)
  const avatarRefs = React.useRef<HTMLDivElement[]>([])
  const avatarRefInitialPositions = React.useRef<number[]>([])
  const containerRef = React.useRef<HTMLDivElement>(null!)

  const isVisible = React.useRef(false)

  const [{ x, y, opacity }, api] = useSpring(
    () => ({
      x: 0,
      y: 0,
      opacity: 0,
    }),
    []
  )

  const [avatarSprings, avatarApi] = useSprings(
    COLORS.length,
    () => ({
      y: 0,
    }),
    []
  )

  React.useLayoutEffect(() => {
    if (avatarRefInitialPositions.current.length === 0) {
      const { y: buttonY } = buttonRef.current.getBoundingClientRect()

      avatarRefInitialPositions.current = avatarRefs.current.map(node => buttonY - node.getBoundingClientRect().y)
    }

    avatarApi.start(i => ({
      y: avatarRefInitialPositions.current[i],
      immediate: true,
    }))
  }, [avatarApi])

  const getBounds = React.useCallback(() => {
    const { height, width } = containerRef.current.getBoundingClientRect()

    return {
      top: 0,
      left: 0,
      right: window.innerWidth - width,
      bottom: window.innerHeight - height,
    }
  }, [])

  const backgroundTimeoutRef = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  const avatarTimeoutRef = React.useRef<ReturnType<typeof setTimeout>>(undefined)

  const bindGestures = useGesture(
    {
      onDrag: ({ down, offset: [ox, oy], velocity: [vx, vy], direction: [dx, dy] }) => {
        api.start({
          x: ox,
          y: oy,
          immediate: down,
          onChange: ({ value }) => {
            const bounds = getBounds()
            if (
              !(value.x >= bounds.left && value.x <= bounds.right && value.y >= bounds.top && value.y <= bounds.bottom)
            ) {
              api.set({
                x: value.x < bounds.left ? bounds.left : value.x > bounds.right ? bounds.right : value.x,
                y: value.y < bounds.top ? bounds.top : value.y > bounds.bottom ? bounds.bottom : value.y,
              })
            }
          },
          config: key => {
            return {
              velocity: key === 'x' ? vx * dx : vy * dy,
              decay: true,
            }
          },
        })
      },
      onHover: ({ hovering }) => {
        if (hovering) {
          if (backgroundTimeoutRef.current) {
            clearTimeout(backgroundTimeoutRef.current)
          }
          if (avatarTimeoutRef.current) {
            clearTimeout(avatarTimeoutRef.current)
          }

          isVisible.current = true

          api.start({
            opacity: 1,
          })

          avatarApi.start({
            y: 0,
          })
        } else {
          backgroundTimeoutRef.current = setTimeout(() => {
            api.start({
              opacity: 0,
            })
          }, 1000)

          avatarTimeoutRef.current = setTimeout(() => {
            avatarApi.start(i => ({
              y: avatarRefInitialPositions.current[i],
              onRest: () => {
                isVisible.current = false
              },
            }))
          }, 2000)
        }
      },
    },
    {
      drag: {
        from: () => [x.get(), y.get()],
        bounds: getBounds,
        rubberband: true,
      },
    }
  )

  const { onPointerEnter, onPointerLeave, onPointerDown, ...restGestures } = bindGestures()

  const handlePointerDown = (isBackground: boolean) => (e: React.PointerEvent<HTMLElement>) => {
    if (isBackground && !isVisible.current) {
      return
    }

    if (onPointerDown) {
      onPointerDown(e)
    }
  }

  return (
    <>
      <BlurredBackground
        ref={containerRef}
        onPointerLeave={onPointerLeave}
        onPointerDown={handlePointerDown(true)}
        {...restGestures}
        style={{
          x,
          y,
          backgroundColor: opacity.to(o => `rgba(0,0,0,${0.2 * o})`),
        }}
      >
        <GrabberButton style={{ opacity }}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M5.5 4.625C6.12132 4.625 6.625 4.12132 6.625 3.5C6.625 2.87868 6.12132 2.375 5.5 2.375C4.87868 2.375 4.375 2.87868 4.375 3.5C4.375 4.12132 4.87868 4.625 5.5 4.625ZM9.5 4.625C10.1213 4.625 10.625 4.12132 10.625 3.5C10.625 2.87868 10.1213 2.375 9.5 2.375C8.87868 2.375 8.375 2.87868 8.375 3.5C8.375 4.12132 8.87868 4.625 9.5 4.625ZM10.625 7.5C10.625 8.12132 10.1213 8.625 9.5 8.625C8.87868 8.625 8.375 8.12132 8.375 7.5C8.375 6.87868 8.87868 6.375 9.5 6.375C10.1213 6.375 10.625 6.87868 10.625 7.5ZM5.5 8.625C6.12132 8.625 6.625 8.12132 6.625 7.5C6.625 6.87868 6.12132 6.375 5.5 6.375C4.87868 6.375 4.375 6.87868 4.375 7.5C4.375 8.12132 4.87868 8.625 5.5 8.625ZM10.625 11.5C10.625 12.1213 10.1213 12.625 9.5 12.625C8.87868 12.625 8.375 12.1213 8.375 11.5C8.375 10.8787 8.87868 10.375 9.5 10.375C10.1213 10.375 10.625 10.8787 10.625 11.5ZM5.5 12.625C6.12132 12.625 6.625 12.1213 6.625 11.5C6.625 10.8787 6.12132 10.375 5.5 10.375C4.87868 10.375 4.375 10.8787 4.375 11.5C4.375 12.1213 4.87868 12.625 5.5 12.625Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            />
          </svg>
        </GrabberButton>
        {avatarSprings.map((springs, index) => (
          <AvatarIcon
            key={COLORS[index]}
            ref={ref => (avatarRefs.current[index] = ref!)}
            css={{
              backgroundColor: COLORS[index],
            }}
            style={springs}
          />
        ))}
        <FloatingButton
          ref={buttonRef}
          onPointerEnter={onPointerEnter}
          onPointerDown={handlePointerDown(false)}
          {...restGestures}
          style={{
            boxShadow: opacity.to(o => `0px 3px 8px 2px rgba(0,0,0,${0.4 * 1 - o})`),
          }}
        >
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="#1a1a1a" viewBox="0 0 256 256">
              <rect width="256" height="256" fill="none"></rect>
              <path d="M128,24A104,104,0,0,0,36.8,178l-8.5,29.9a16.1,16.1,0,0,0,4,15.8,15.8,15.8,0,0,0,15.7,4l30-8.5A104,104,0,1,0,128,24Zm32,128H96a8,8,0,0,1,0-16h64a8,8,0,0,1,0,16Zm0-32H96a8,8,0,0,1,0-16h64a8,8,0,0,1,0,16Z"></path>
            </svg>
          </span>
        </FloatingButton>
      </BlurredBackground>
      <ImageContainer>
        <img src="/bright-rain.png" />
      </ImageContainer>
    </>
  )
}

const ImageContainer = styled('div', {
  width: '100vw',
  height: '100vh',

  '& > img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
})

const BlurredBackground = styled(animated.div, {
  position: 'absolute',
  padding: 12,
  borderRadius: 8,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  backdropFilter: 'blur(8px)',
  alignItems: 'center',
  touchAction: 'none',
})

const GrabberButton = styled(animated.button, {
  height: 17,
  borderRadius: 8,
  backgroundColor: '#cccccc33',
  border: 'none',
  mx: 8,
  mb: 4,
  width: 'calc(100% - 16px)',

  '& > svg': {
    color: 'white',
    transform: `rotate(90deg)`,
  },
})

const AvatarIcon = styled(animated.div, {
  width: BUTTON_SIZE,
  height: BUTTON_SIZE,
  borderRadius: '50%',
  mx: 4,
})

const FloatingButton = styled(animated.div, {
  width: BUTTON_SIZE,
  height: BUTTON_SIZE,
  borderRadius: '50%',
  border: 'none',
  position: 'relative',
  backgroundClip: 'content-box',
  zIndex: 0,
  touchAction: 'none',

  '&:focus-visible': {
    outlineOffset: 2,
    outline: '#569AFF99 auto 6px',
  },

  '& > span': {
    borderRadius: 'inherit',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: '#fafafa',
  },
})

export default App
