import * as React from 'react'
import { useContext, PropsWithChildren } from 'react'
import { useMemoOne } from '@react-spring/shared'

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
  const pause = props.pause || !!inherited.pause,
    immediate = props.immediate || !!inherited.immediate

  // Memoize the context to avoid unwanted renders.
  props = useMemoOne(() => ({ pause, immediate }), [pause, immediate])

  const { Provider } = ctx
  return <Provider value={props}>{children}</Provider>
}

const ctx = makeContext(SpringContext, {} as SpringContext)

// Allow `useContext(SpringContext)` in TypeScript.
SpringContext.Provider = ctx.Provider
SpringContext.Consumer = ctx.Consumer

/** Make the `target` compatible with `useContext` */
function makeContext<T>(target: any, init: T): React.Context<T> {
  Object.assign(target, React.createContext(init))
  target.Provider._context = target
  target.Consumer._context = target
  return target
}
