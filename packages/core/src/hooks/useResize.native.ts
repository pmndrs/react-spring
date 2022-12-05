import { once, prefix } from '@react-spring/shared'

const warnImplementation = once(console.warn)

export const useResize = () => {
  warnImplementation(
    `${prefix} useResize is not implemented on native platforms. Consider submitting a PR to resolve this – https://github.com/pmndrs/react-spring`
  )

  return null
}
