import { AnimatedValue } from 'animated'
import { FluidValue } from 'shared'
import { OnRest, OnStart, OnChange } from './types/animated'
import { AnimationConfig } from './AnimationConfig'

const emptyArray: readonly any[] = []

/** An animation being executed by the frameloop */
export class Animation<T = any> {
  changed = false
  values: readonly AnimatedValue[] = emptyArray
  toValues: readonly number[] | null = null
  fromValues: readonly number[] = emptyArray

  to!: T | FluidValue<T>
  from!: T | FluidValue<T>
  config = new AnimationConfig()
  immediate = false
  onStart?: OnStart<T>
  onChange?: OnChange<T>
  onRest?: Array<OnRest<T>>
}
