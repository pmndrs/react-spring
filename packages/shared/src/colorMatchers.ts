// const INTEGER = '[-+]?\\d+';
const NUMBER = '[-+]?\\d*\\.?\\d+'
const PERCENTAGE = NUMBER + '%'

function call(...parts: string[]) {
  return '\\(\\s*(' + parts.join(')\\s*,\\s*(') + ')\\s*\\)'
}

export const rgb = new RegExp(
  'rgb' + /* @__PURE__ */ call(NUMBER, NUMBER, NUMBER)
)
export const rgba = new RegExp(
  'rgba' + /* @__PURE__ */ call(NUMBER, NUMBER, NUMBER, NUMBER)
)
export const hsl = new RegExp(
  'hsl' + /* @__PURE__ */ call(NUMBER, PERCENTAGE, PERCENTAGE)
)
export const hsla = new RegExp(
  'hsla' + /* @__PURE__ */ call(NUMBER, PERCENTAGE, PERCENTAGE, NUMBER)
)
export const hex3 = /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/
export const hex4 =
  /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/
export const hex6 = /^#([0-9a-fA-F]{6})$/
export const hex8 = /^#([0-9a-fA-F]{8})$/
