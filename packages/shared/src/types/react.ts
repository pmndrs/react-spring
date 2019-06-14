// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/34237
export type ElementType<P = any> =
  | React.ElementType<P>
  | LeafFunctionComponent<P>

// Function component without children
type LeafFunctionComponent<P> = {
  (props: P): React.ReactElement | null
  displayName?: string
}

export type ComponentPropsWithRef<
  T extends ElementType
> = T extends React.ComponentClass<infer P>
  ? React.PropsWithoutRef<P> & React.RefAttributes<InstanceType<T>>
  : React.PropsWithRef<React.ComponentProps<T>>
