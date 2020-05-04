import { AnimatedValue } from 'animated'
import { FluidValue } from 'shared'
import { AnimationConfig } from './AnimationConfig'
import { OnStart, OnChange } from './types'

const emptyArray: readonly any[] = []

/** @internal */
type OnRest = (cancel?: boolean) => void

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
  onRest: OnRest[] = []
}
