import { ThemeValue } from '~/components/Site/SiteThemePicker'
import { useTheme } from './useTheme'

export const useIsDarkTheme = () => {
  const theme = useTheme()

  const isDarkMode = theme === ThemeValue.Dark

  return isDarkMode
}
