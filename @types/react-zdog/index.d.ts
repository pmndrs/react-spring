declare module 'react-zdog' {
  export const addEffect: (cb: () => void) => void
  export const applyProps: (
    instance: any,
    newProps: any,
    oldProps?: any,
    accumulative?: boolean
  ) => void
  export const invalidate: () => void
  export const useRender: (fn: () => void, deps?: any[]) => void

  // Elements
  type ElementType = import('react').ElementType
  export const Illustration: ElementType
  export const Anchor: ElementType
  export const Shape: ElementType
  export const Group: ElementType
  export const Rect: ElementType
  export const RoundedRect: ElementType
  export const Ellipse: ElementType
  export const Polygon: ElementType
  export const Hemisphere: ElementType
  export const Cylinder: ElementType
  export const Cone: ElementType
  export const Box: ElementType
}
