import { atom, useAtom } from 'jotai'
import * as Toolbar from '@radix-ui/react-toolbar'
import { MoonStars, Sun } from 'phosphor-react'
import { animated, useSpring } from '@react-spring/web'

import { styled } from '~/styles/stitches.config'

import { AccessibleIcon } from '../AccessibleIcon'
import { useIsomorphicLayoutEffect } from '~/hooks/useIsomorphicEffect'

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
    <ThemeGroup onValueChange={handleValueChange} value={theme} type="single">
      <ThemePicker
        onPointerEnter={handlePointerEnter(ThemeValue.Light)}
        onPointerOut={handlePointerOut(ThemeValue.Light)}
        value="light"
      >
        <AccessibleIcon label="Enable light mode">
          <Sun size={20} weight={isDarkMode ? 'light' : 'regular'} />
        </AccessibleIcon>
      </ThemePicker>
      <ThemePicker
        onPointerEnter={handlePointerEnter(ThemeValue.Dark)}
        onPointerOut={handlePointerOut(ThemeValue.Dark)}
        value="dark"
      >
        <AccessibleIcon label="Enable dark mode">
          <MoonStars size={20} weight={isDarkMode ? 'light' : 'regular'} />
        </AccessibleIcon>
      </ThemePicker>
      <ThemeActiveBlob style={styles} />
    </ThemeGroup>
  )
}

const ThemeGroup = styled(Toolbar.ToggleGroup, {
  height: '4.6rem',
  width: '9.2rem',
  position: 'relative',
  backgroundColor: '$codeBackground',
  borderRadius: '$r8',
  zIndex: 0,
})

const ThemePicker = styled(Toolbar.ToggleItem, {
  background: 'transparent',
  border: 'none',
  width: '50%',
  height: '100%',
  display: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '$r8',
  p: 2,
  cursor: 'pointer',
  position: 'relative',
  zIndex: 1,

  svg: {
    pointerEvents: 'none',
  },
})

const ThemeActiveBlob = styled(animated.div, {
  height: 42,
  backgroundColor: '$white',
  position: 'absolute',
  zIndex: 0,
  top: 2,
  borderRadius: '$r8',
  transition: 'left 400ms ease-out, right 400ms ease-out',
})
