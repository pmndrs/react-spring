import { useState } from 'react'
import { Lookup } from '@react-spring/types'
import { SpringRef } from '../SpringRef'

const initSpringRef = () => new SpringRef<any>()

export const useSpringRef = <State extends Lookup = Lookup>() =>
  useState(initSpringRef)[0] as SpringRef<State>
