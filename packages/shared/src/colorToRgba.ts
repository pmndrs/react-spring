import { normalizeColor } from './normalizeColor'

export function colorToRgba(input: string) {
  let int32Color = normalizeColor(input)
  if (int32Color === null) return input
  int32Color = int32Color || 0
  const r = (int32Color & 0xff000000) >>> 24
  const g = (int32Color & 0x00ff0000) >>> 16
  const b = (int32Color & 0x0000ff00) >>> 8
  const a = (int32Color & 0x000000ff) / 255
  return `rgba(${r}, ${g}, ${b}, ${a})`
}
