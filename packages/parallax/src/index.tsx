import * as React from 'react'
import { useContext, useState, useRef, useEffect, CSSProperties } from 'react'
import { useMemoOne, useOnce, raf } from '@react-spring/shared'
import {
  a,
  Controller,
  SpringConfig,
  config as configs,
} from '@react-spring/web'

const ParentContext = React.createContext<any>(null)

function getScrollType(horizontal: boolean) {
  return horizontal ? 'scrollLeft' : 'scrollTop'
}

function mapChildrenRecursive(
  children: React.ReactNode,
  callback: Function
): React.ReactNode {
  const isReactFragment = (node: any) => {
    if (node.type) {
      return node.type === React.Fragment
    }
    return node === React.Fragment
  }

  return React.Children.map(children, (child: any) =>
    isReactFragment(child)
      ? mapChildrenRecursive(child.props.children, callback)
      : callback(child)
  )
}

const START_TRANSLATE_3D = 'translate3d(0px,0px,0px)'
const START_TRANSLATE = 'translate(0px,0px)'

export interface IParallaxLayer {
  horizontal: boolean
  sticky: StickyConfig
  isSticky: boolean
  setHeight(height: number, immediate?: boolean): void
  setPosition(height: number, scrollTop: number, immediate?: boolean): void
}

export interface IParallax {
  config: ConfigProp
  horizontal: boolean
  busy: boolean
  space: number
  offset: number
  current: number
  controller: Controller<{ scroll: number }>
  layers: Set<IParallaxLayer>
  container: React.MutableRefObject<any>
  content: React.MutableRefObject<any>
  scrollTo(offset: number): void
  update(): void
  stop(): void
}

type ViewProps = React.ComponentPropsWithoutRef<'div'>

type StickyConfig = { start?: number; end?: number } | undefined

export interface ParallaxLayerProps extends ViewProps {
  horizontal?: boolean
  /** Size of a page, (1=100%, 1.5=1 and 1/2, ...) */
  factor?: number
  /** Determines where the layer will be at when scrolled to (0=start, 1=1st page, ...) */
  offset?: number
  /** Shifts the layer in accordance to its offset, values can be positive or negative */
  speed?: number
  /** Layer will be sticky between these two offsets, all other props are ignored */
  sticky?: StickyConfig
}

export const ParallaxLayer = React.memo(
  React.forwardRef<IParallaxLayer, ParallaxLayerProps>(
    (
      { horizontal, factor = 1, offset = 0, speed = 0, sticky, ...rest },
      ref
    ) => {
      // Our parent controls our height and position.
      const parent = useContext<IParallax>(ParentContext)

      // This is how we animate.
      const ctrl = useMemoOne(() => {
        let translate
        if (sticky) {
          const start = sticky.start || 0
          translate = start * parent.space
        } else {
          const targetScroll = Math.floor(offset) * parent.space
          const distance = parent.space * offset + targetScroll * speed
          translate = -(parent.current * speed) + distance
        }
        type Animated = { space: number; translate: number }
        return new Controller<Animated>({
          space: sticky ? parent.space : parent.space * factor,
          translate,
        })
      }, [])

      // Create the layer.
      const layer = useMemoOne<IParallaxLayer>(
        () => ({
          horizontal:
            horizontal === undefined || sticky ? parent.horizontal : horizontal,
          sticky: undefined,
          isSticky: false,
          setPosition(height, scrollTop, immediate = false) {
            if (sticky) {
              setSticky(height, scrollTop)
            } else {
              const targetScroll = Math.floor(offset) * height
              const distance = height * offset + targetScroll * speed
              ctrl.start({
                translate: -(scrollTop * speed) + distance,
                config: parent.config,
                immediate,
              })
            }
          },
          setHeight(height, immediate = false) {
            ctrl.start({
              space: sticky ? height : height * factor,
              config: parent.config,
              immediate,
            })
          },
        }),
        []
      )

      useOnce(() => {
        if (sticky) {
          const start = sticky.start || 0
          const end = sticky.end || start + 1
          layer.sticky = { start, end }
        }
      })

      React.useImperativeHandle(ref, () => layer)

      const layerRef = useRef<any>()

      const setSticky = (height: number, scrollTop: number) => {
        const start = layer.sticky!.start! * height
        const end = layer.sticky!.end! * height
        const isSticky = scrollTop >= start && scrollTop <= end

        if (isSticky === layer.isSticky) return
        layer.isSticky = isSticky

        const ref = layerRef.current
        ref.style.position = isSticky ? 'sticky' : 'absolute'
        ctrl.set({
          translate: isSticky ? 0 : scrollTop < start ? start : end,
        })
      }

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
        layer.horizontal
          ? x => `translate3d(${x}px,0,0)`
          : y => `translate3d(0,${y}px,0)`
      )

      return (
        <a.div
          {...rest}
          ref={layerRef}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundSize: 'auto',
            backgroundRepeat: 'no-repeat',
            willChange: 'transform',
            [layer.horizontal ? 'height' : 'width']: '100%',
            [layer.horizontal ? 'width' : 'height']: ctrl.springs.space,
            WebkitTransform: translate3d,
            msTransform: translate3d,
            transform: translate3d,
            ...rest.style,
          }}
        />
      )
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
      children,
      ...rest
    } = props

    const containerRef = useRef<any>()
    const contentRef = useRef<any>()

    const state: IParallax = useMemoOne(
      () => ({
        config,
        horizontal,
        busy: false,
        space: 0,
        current: 0,
        offset: 0,
        controller: new Controller({ scroll: 0 }),
        layers: new Set<IParallaxLayer>(),
        container: containerRef,
        content: contentRef,
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

      state.controller.set({ scroll: state.current })
      state.controller.stop().start({
        scroll: offset * state.space,
        config,
        onChange({ value: { scroll } }: any) {
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

    const overflow: React.CSSProperties = enabled
      ? {
          overflowY: horizontal ? 'hidden' : 'scroll',
          overflowX: horizontal ? 'scroll' : 'hidden',
        }
      : {
          overflowY: 'hidden',
          overflowX: 'hidden',
        }

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
          ...overflow,
          WebkitOverflowScrolling: 'touch',
          WebkitTransform: START_TRANSLATE,
          msTransform: START_TRANSLATE,
          transform: START_TRANSLATE_3D,
          ...rest.style,
        }}>
        {ready && (
          <>
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
                {mapChildrenRecursive(
                  children,
                  (child: any) => !child.props.sticky && child
                )}
              </ParentContext.Provider>
            </a.div>
            <ParentContext.Provider value={state}>
              {mapChildrenRecursive(
                children,
                (child: any) => child.props.sticky && child
              )}
            </ParentContext.Provider>
          </>
        )}
      </a.div>
    )
  })
)
