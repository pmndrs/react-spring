import * as THREE from 'three'
import 'react-three-fiber'

export type Primitives = keyof JSX.IntrinsicElements

export const primitives = ['primitive'].concat(
  Object.keys(THREE)
    .filter(key => /^[A-Z]/.test(key))
    .map(key => key[0].toLowerCase() + key.slice(1))
) as Primitives[]
