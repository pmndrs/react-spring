import { useAtom } from 'jotai'

import { themeAtom, ThemeValue } from '~/components/Site/SiteThemePicker'

export const useIsDarkTheme = () => {
  const [theme] = useAtom(themeAtom)

  const isDarkMode = theme === ThemeValue.Dark

  return isDarkMode
}
