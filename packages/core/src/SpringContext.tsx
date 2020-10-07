import * as React from 'react'
import { useContext, PropsWithChildren } from 'react'
import { useMemo } from './helpers'

/**
 * This context affects all new and existing `SpringValue` objects
 * created with the hook API or the renderprops API.
 */
export interface SpringContext {
  /** Pause all new and existing animations. */
  pause?: boolean
  /** Force all new and existing animations to be immediate. */
  immediate?: boolean
}

export const SpringContext = ({
  children,
  ...props
}: PropsWithChildren<SpringContext>) => {
  const inherited = useContext(SpringContext)
  const { pause = inherited.pause, immediate = inherited.immediate } = props

  // Memoize the context to avoid unwanted renders.
  props = useMemo(() => ({ pause, immediate }), [pause, immediate])

  const { Provider } = SpringContext
  return <Provider value={props}>{children}</Provider>
}

// Ensure `useContext(SpringContext)` works
const ctx = React.createContext<SpringContext>({})
Object.assign(SpringContext, ctx)

// See #988
SpringContext.Provider = ctx.Provider
SpringContext.Consumer = ctx.Consumer
