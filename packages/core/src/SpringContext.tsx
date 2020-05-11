import * as React from 'react'
import { useContext, PropsWithChildren } from 'react'
import { SpringConfig } from './types'
import { useMemo } from './helpers'

/**
 * This context affects all new and existing `SpringValue` objects
 * created with the hook API or the renderprops API.
 */
export interface SpringContext {
  /** Pause all new and existing animations. */
  pause?: boolean
  /** Cancel all new and existing animations. */
  cancel?: boolean
  /** Force all new and existing animations to be immediate. */
  immediate?: boolean
  /** Set the default `config` prop for future animations. */
  config?: SpringConfig
}

const ctx = React.createContext<SpringContext>({})

export const SpringContext = ({
  children,
  ...props
}: PropsWithChildren<SpringContext>) => {
  const inherited = useContext(ctx)

  // Memoize the context to avoid unwanted renders.
  props = useMemo(() => ({ ...inherited, ...props }), [
    inherited,
    props.pause,
    props.cancel,
    props.immediate,
    props.config,
  ])

  const { Provider } = ctx
  return <Provider value={props}>{children}</Provider>
}

SpringContext.Provider = ctx.Provider
SpringContext.Consumer = ctx.Consumer

/** Get the current values of nearest `SpringContext` component. */
export const useSpringContext = () => useContext(ctx)
