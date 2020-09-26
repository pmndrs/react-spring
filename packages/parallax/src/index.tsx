import * as React from 'react'
import { useContext, useState, useRef, useEffect, CSSProperties } from 'react'
import { useOnce, raf } from '@react-spring/shared'
import {
  a,
  Controller,
  SpringConfig,
  config as configs,
} from '@react-spring/web'
import { useMemoOne } from 'use-memo-one'

const ParentContext = React.createContext<any>(null)

function getScrollType(horizontal: boolean) {
  return horizontal ? 'scrollLeft' : 'scrollTop'
}

const START_TRANSLATE_3D = 'translate3d(0px,0px,0px)'
const START_TRANSLATE = 'translate(0px,0px)'

export interface IParallaxLayer {
  setHeight(height: number, immediate?: boolean): void
  setPosition(height: number, scrollTop: number, immediate?: boolean): void
}

export interface IParallax {
  config: ConfigProp
  busy: boolean
  space: number
  offset: number
  current: number
  controller: Controller<{ scroll: number }>
  layers: Set<IParallaxLayer>
  scrollTo(offset: number): void
  update(): void
  stop(): void
}

type ViewProps = React.ComponentPropsWithoutRef<'div'>

export interface ParallaxLayerProps extends ViewProps {
  horizontal?: boolean
  /** Size of a page, (1=100%, 1.5=1 and 1/2, ...) */
  factor?: number
  /** Determines where the layer will be at when scrolled to (0=start, 1=1st page, ...) */
  offset?: number
  /** Shifts the layer in accordance to its offset, values can be positive or negative */
  speed?: number
}

export const ParallaxLayer = React.memo(
  React.forwardRef<IParallaxLayer, ParallaxLayerProps>(
    ({ horizontal, factor = 1, offset = 0, speed = 0, ...rest }, ref) => {
      // Our parent controls our height and position.
      const parent = useContext<IParallax>(ParentContext)

      // This is how we animate.
      const ctrl = useMemoOne(() => {
        const targetScroll = Math.floor(offset) * parent.space
        const distance = parent.space * offset + targetScroll * speed
        type Animated = { space: number; translate: number }
        return new Controller<Animated>({
          space: parent.space * factor,
          translate: -(parent.current * speed) + distance,
        })
      }, [])

      // Create the layer.
      const layer = useMemoOne<IParallaxLayer>(
        () => ({
          setPosition(height, scrollTop, immediate = false) {
            const targetScroll = Math.floor(offset) * height
            const distance = height * offset + targetScroll * speed
            ctrl.start({
              translate: -(scrollTop * speed) + distance,
              config: parent.config,
              immediate,
            })
          },
          setHeight(height, immediate = false) {
            ctrl.start({
              space: height * factor,
              config: parent.config,
              immediate,
            })
          },
        }),
        []
      )

      React.useImperativeHandle(ref, () => layer)

      // Register the layer with our parent.
      useOnce(() => {
        if (parent) {
          parent.layers.add(layer)
          parent.update()
          return () => {
            parent.layers.delete(layer)
            parent.update()
          }
        }
      })

      const translate3d = ctrl.springs.translate.to(
        horizontal
          ? x => `translate3d(${x}px,0,0)`
          : y => `translate3d(0,${y}px,0)`
      )

      return (
        <a.div
          {...rest}
          style={{
            position: 'absolute',
            backgroundSize: 'auto',
            backgroundRepeat: 'no-repeat',
            willChange: 'transform',
            [horizontal ? 'height' : 'width']: '100%',
            [horizontal ? 'width' : 'height']: ctrl.springs.space,
            WebkitTransform: translate3d,
            msTransform: translate3d,
            transform: translate3d,
            ...rest.style,
          }}
        />
      )
      return null
    }
  )
)

type ConfigProp = SpringConfig | ((key: string) => SpringConfig)

export interface ParallaxProps extends ViewProps {
  /** Determines the total space of the inner content where each page takes 100% of the visible container */
  pages: number
  config?: ConfigProp
  enabled?: boolean
  horizontal?: boolean
  innerStyle?: CSSProperties
}

export const Parallax = React.memo(
  React.forwardRef<IParallax, ParallaxProps>((props, ref) => {
    const [ready, setReady] = useState(false)
    const {
      pages,
      innerStyle,
      config = configs.slow,
      enabled = true,
      horizontal = false,
      ...rest
    } = props

    const state: IParallax = useMemoOne(
      () => ({
        config,
        busy: false,
        space: 0,
        current: 0,
        offset: 0,
        controller: new Controller({ scroll: 0 }),
        layers: new Set<IParallaxLayer>(),
        update: () => update(),
        scrollTo: offset => scrollTo(offset),
        stop: () => state.controller.stop(),
      }),
      []
    )

    useEffect(() => {
      state.config = config
    }, [config])

    React.useImperativeHandle(ref, () => state)

    const containerRef = useRef<any>()
    const contentRef = useRef<any>()

    const update = () => {
      const container = containerRef.current
      if (!container) return

      const spaceProp = horizontal ? 'clientWidth' : 'clientHeight'
      state.space = container[spaceProp]

      const scrollType = getScrollType(horizontal)
      if (enabled) {
        state.current = container[scrollType]
      } else {
        container[scrollType] = state.current = state.offset * state.space
      }

      const content = contentRef.current
      if (content) {
        const sizeProp = horizontal ? 'width' : 'height'
        content.style[sizeProp] = `${state.space * pages}px`
      }

      state.layers.forEach(layer => {
        layer.setHeight(state.space, true)
        layer.setPosition(state.space, state.current, true)
      })
    }

    const scrollTo = (offset: number) => {
      const container = containerRef.current
      const scrollType = getScrollType(horizontal)

      state.offset = offset
      state.controller.stop().start({
        scroll: offset * state.space,
        config,
        onChange({ scroll }: any) {
          container[scrollType] = scroll
        },
      })
    }

    const onScroll = (event: any) => {
      if (!state.busy) {
        state.busy = true
        state.current = event.target[getScrollType(horizontal)]
        raf.onStart(() => {
          state.layers.forEach(layer =>
            layer.setPosition(state.space, state.current)
          )
          state.busy = false
        })
      }
    }

    useEffect(() => state.update())
    useOnce(() => {
      setReady(true)

      const onResize = () => {
        const update = () => state.update()
        raf.onFrame(update)
        setTimeout(update, 150) // Some browsers don't fire on maximize!
      }

      window.addEventListener('resize', onResize, false)
      return () => window.removeEventListener('resize', onResize, false)
    })

    const overflow = enabled ? 'scroll' : 'hidden'
    return (
      <a.div
        {...rest}
        ref={containerRef}
        onScroll={onScroll}
        onWheel={enabled ? state.stop : undefined}
        onTouchStart={enabled ? state.stop : undefined}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          overflow,
          overflowY: horizontal ? 'hidden' : overflow,
          overflowX: horizontal ? overflow : 'hidden',
          WebkitOverflowScrolling: 'touch',
          WebkitTransform: START_TRANSLATE,
          msTransform: START_TRANSLATE,
          transform: START_TRANSLATE_3D,
          ...rest.style,
        }}>
        {ready && (
          <a.div
            ref={contentRef}
            style={{
              overflow: 'hidden',
              position: 'absolute',
              [horizontal ? 'height' : 'width']: '100%',
              [horizontal ? 'width' : 'height']: state.space * pages,
              WebkitTransform: START_TRANSLATE,
              msTransform: START_TRANSLATE,
              transform: START_TRANSLATE_3D,
              ...props.innerStyle,
            }}>
            <ParentContext.Provider value={state}>
              {rest.children}
            </ParentContext.Provider>
          </a.div>
        )}
      </a.div>
    )
  })
)
