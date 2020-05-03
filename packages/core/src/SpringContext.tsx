import React, { useContext, PropsWithChildren } from 'react'

/**
 * This context affects all new `SpringValue` objects created with
 * the hook API or the renderprops API.
 */
export interface SpringContext {
  /** Pause all new and existing animations. */
  pause?: boolean
  /** Cancel all new and existing animations. */
  cancel?: boolean
  /** Force all new and existing animations to be immediate. */
  immediate?: boolean
}

const ctx = React.createContext<SpringContext>({})

export const SpringContext = ({
  children,
  ...props
}: PropsWithChildren<SpringContext>) => {
  const inherited = useContext(ctx)
  props = { ...inherited, ...props }

  const { Provider } = ctx
  return <Provider value={props}>{children}</Provider>
}

export const useSpringContext = () => useContext(ctx)
