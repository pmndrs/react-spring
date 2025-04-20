import * as React from 'react'
import { useContext, PropsWithChildren } from 'react'

/**
 * This context affects all new and existing `SpringValue` objects
 * created with the hook API or the renderprops API.
 */
export interface ISpringContext {
  /** Pause all new and existing animations. */
  pause?: boolean
  /** Force all new and existing animations to be immediate. */
  immediate?: boolean
}

export const SpringContext = React.createContext<ISpringContext>({
  pause: false,
  immediate: false,
})

export const SpringContextProvider = ({
  children,
  ...props
}: PropsWithChildren<ISpringContext>) => {
  const inherited = useContext(SpringContext)

  // Inherited values are dominant when truthy.
  const pause = props.pause ?? inherited.pause ?? false
  const immediate = props.immediate ?? inherited.immediate ?? false

  // Memoize the context to avoid unwanted renders.
  const contextValue = React.useMemo(
    () => ({ pause, immediate }),
    [pause, immediate]
  )
  return (
    <SpringContext.Provider value={contextValue}>
      {children}
    </SpringContext.Provider>
  )
}
