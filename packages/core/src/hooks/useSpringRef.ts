import { useState } from 'react'
import { Lookup } from '@react-spring/types'
import { SpringRef } from '../SpringRef'
import type { SpringRef as SpringRefType } from '../SpringRef'

const initSpringRef = () => SpringRef<any>()

export const useSpringRef = <State extends Lookup = Lookup>() =>
  useState(initSpringRef)[0] as SpringRefType<State>
