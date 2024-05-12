import { atom, useAtom } from 'jotai'
import * as Toolbar from '@radix-ui/react-toolbar'
import { MoonStars, Sun } from 'phosphor-react'
import { animated, useSpring } from '@react-spring/web'

import { AccessibleIcon } from '../AccessibleIcon'
import { useIsomorphicLayoutEffect } from '~/hooks/useIsomorphicEffect'
import { themeActiveBlob, themeGroup, themePicker } from './SiteThemePicker.css'

export enum ThemeValue {
  Dark = 'dark',
  Light = 'light',
}

export const themeAtom = atom(ThemeValue.Light)

export const SiteThemePicker = () => {
  const [theme, setTheme] = useAtom(themeAtom)

  const [styles, api] = useSpring(
    () => ({
      width: 0,
      left: theme === 'light' ? '2px' : 'unset',
      right: theme === 'light' ? 'unset' : '2px',
      config: {
        tension: 300,
        clamp: true,
      },
    }),
    []
  )

  useIsomorphicLayoutEffect(() => {
    const isDefaultDark = document.documentElement.classList.contains('dark')

    api.start({
      width: 42,
      left: !isDefaultDark ? '2px' : 'unset',
      right: !isDefaultDark ? 'unset' : '2px',
      immediate: true,
    })

    setTheme(isDefaultDark ? ThemeValue.Dark : ThemeValue.Light)
  }, [])

  useIsomorphicLayoutEffect(() => {
    const dClass = document.documentElement.classList

    dClass.remove('dark', 'light')

    dClass.add(theme)

    window.localStorage.setItem('theme', theme)
  }, [theme])

  const isDarkMode = theme === ThemeValue.Dark

  const handleValueChange = async (value: ThemeValue) => {
    if (value && value !== theme) {
      setTheme(value)

      api.start({
        to: async animate => {
          await animate({ width: 88 })
          api.set({
            left: value === 'light' ? '2px' : 'unset',
            right: value === 'light' ? 'unset' : '2px',
          })
          await animate({ width: 42 })
        },
      })
    }
  }

  const handlePointerEnter = (value: ThemeValue) => () => {
    if (theme !== value) {
      api.start({
        width: 52,
      })
    }
  }

  const handlePointerOut = (value: ThemeValue) => () => {
    if (theme !== value) {
      api.start({
        width: 42,
      })
    }
  }

  return (
    <Toolbar.ToggleGroup
      className={themeGroup}
      onValueChange={handleValueChange}
      value={theme}
      type="single"
    >
      <Toolbar.ToggleItem
        className={themePicker}
        onPointerEnter={handlePointerEnter(ThemeValue.Light)}
        onPointerOut={handlePointerOut(ThemeValue.Light)}
        value="light"
      >
        <AccessibleIcon label="Enable light mode">
          <Sun
            size={20}
            weight={isDarkMode ? 'light' : 'regular'}
            style={{ pointerEvents: 'none' }}
          />
        </AccessibleIcon>
      </Toolbar.ToggleItem>
      <Toolbar.ToggleItem
        className={themePicker}
        onPointerEnter={handlePointerEnter(ThemeValue.Dark)}
        onPointerOut={handlePointerOut(ThemeValue.Dark)}
        value="dark"
      >
        <AccessibleIcon label="Enable dark mode">
          <MoonStars
            size={20}
            weight={isDarkMode ? 'light' : 'regular'}
            style={{ pointerEvents: 'none' }}
          />
        </AccessibleIcon>
      </Toolbar.ToggleItem>
      <animated.div className={themeActiveBlob} style={styles} />
    </Toolbar.ToggleGroup>
  )
}
