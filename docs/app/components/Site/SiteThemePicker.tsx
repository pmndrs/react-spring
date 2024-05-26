import * as Toolbar from '@radix-ui/react-toolbar'
import { MoonStars, Sun } from 'phosphor-react'
import { animated, useSpring } from '@react-spring/web'

import { AccessibleIcon } from '../AccessibleIcon'
import { themeActiveBlob, themeGroup, themePicker } from './SiteThemePicker.css'
import { useOptimisticThemeMode, useTheme } from '../../hooks/useTheme'
import { useFetcher } from '@remix-run/react'
import { action } from '../../root'

export enum ThemeValue {
  Dark = 'dark',
  Light = 'light',
}

export const SiteThemePicker = () => {
  const fetcher = useFetcher<typeof action>()

  const optimisticMode = useOptimisticThemeMode()
  const userPreference = useTheme()
  const mode = optimisticMode ?? userPreference ?? 'light'

  const [styles, api] = useSpring(
    () => ({
      width: 42,
      left: mode === 'light' ? '2px' : 'unset',
      right: mode === 'light' ? 'unset' : '2px',
      config: {
        tension: 300,
        clamp: true,
      },
    }),
    [mode]
  )

  const isDarkMode = mode === ThemeValue.Dark

  const handleValueChange = async (value: ThemeValue) => {
    if (value && value !== mode) {
      const css = document.createElement('style')
      css.type = 'text/css'
      css.appendChild(
        document.createTextNode(
          `* {
       -webkit-transition: none !important;
       -moz-transition: none !important;
       -o-transition: none !important;
       -ms-transition: none !important;
       transition: none !important;
    }`
        )
      )
      document.head.appendChild(css)

      fetcher.submit(
        {
          theme: value,
        },
        {
          method: 'POST',
          encType: 'application/json',
          action: '/',
        }
      )

      api.start({
        to: async animate => {
          await animate({ width: 88 })
          api.set({
            left: value === 'light' ? '2px' : 'unset',
            right: value === 'light' ? 'unset' : '2px',
          })
          await animate({ width: 42 })

          const _ = window.getComputedStyle(css).opacity
          document.head.removeChild(css)
        },
      })
    }
  }

  const handlePointerEnter = (value: ThemeValue) => () => {
    if (mode !== value) {
      api.start({
        width: 52,
      })
    }
  }

  const handlePointerOut = (value: ThemeValue) => () => {
    if (mode !== value) {
      api.start({
        width: 42,
      })
    }
  }

  return (
    <Toolbar.ToggleGroup
      className={themeGroup}
      onValueChange={handleValueChange}
      value={mode}
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
