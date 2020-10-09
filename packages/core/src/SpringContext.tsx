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
  const inherited = useContext(ctx)

  // Inherited values are dominant when truthy.
  const pause = props.pause || inherited.pause,
    immediate = props.immediate || inherited.immediate

  // Memoize the context to avoid unwanted renders.
  props = useMemo(() => ({ pause, immediate }), [pause, immediate])

  const { Provider } = ctx
  return <Provider value={props}>{children}</Provider>
}

const ctx = React.createContext<SpringContext>({})

// See #988
SpringContext.Provider = ctx.Provider
SpringContext.Consumer = ctx.Consumer

// Ensure `useContext(SpringContext)` works
Object.defineProperty(SpringContext, '_currentValue', {
  get: () => (ctx as any)._currentValue,
})
