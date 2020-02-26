/*
https://github.com/react-community/normalize-css-color

BSD 3-Clause License

Copyright (c) 2016, React Community
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of the copyright holder nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

import * as matchers from './colorMatchers'
import colorNames, { ColorName } from './colors'

export default function normalizeColor(color: number | string) {
  let match

  if (typeof color === 'number') {
    return color >>> 0 === color && color >= 0 && color <= 0xffffffff
      ? color
      : null
  }

  // Ordered based on occurrences on Facebook codebase
  if ((match = matchers.hex6.exec(color)))
    return parseInt(match[1] + 'ff', 16) >>> 0

  if (colorNames.hasOwnProperty(color)) return colorNames[color as ColorName]

  if ((match = matchers.rgb.exec(color))) {
    return (
      ((parse255(match[1]) << 24) | // r
      (parse255(match[2]) << 16) | // g
      (parse255(match[3]) << 8) | // b
        0x000000ff) >>> // a
      0
    )
  }

  if ((match = matchers.rgba.exec(color))) {
    return (
      ((parse255(match[1]) << 24) | // r
      (parse255(match[2]) << 16) | // g
      (parse255(match[3]) << 8) | // b
        parse1(match[4])) >>> // a
      0
    )
  }

  if ((match = matchers.hex3.exec(color))) {
    return (
      parseInt(
        match[1] +
        match[1] + // r
        match[2] +
        match[2] + // g
        match[3] +
        match[3] + // b
          'ff', // a
        16
      ) >>> 0
    )
  }

  // https://drafts.csswg.org/css-color-4/#hex-notation
  if ((match = matchers.hex8.exec(color))) return parseInt(match[1], 16) >>> 0

  if ((match = matchers.hex4.exec(color))) {
    return (
      parseInt(
        match[1] +
        match[1] + // r
        match[2] +
        match[2] + // g
        match[3] +
        match[3] + // b
          match[4] +
          match[4], // a
        16
      ) >>> 0
    )
  }

  if ((match = matchers.hsl.exec(color))) {
    return (
      (hslToRgb(
        parse360(match[1]), // h
        parsePercentage(match[2]), // s
        parsePercentage(match[3]) // l
      ) |
        0x000000ff) >>> // a
      0
    )
  }

  if ((match = matchers.hsla.exec(color))) {
    return (
      (hslToRgb(
        parse360(match[1]), // h
        parsePercentage(match[2]), // s
        parsePercentage(match[3]) // l
      ) |
        parse1(match[4])) >>> // a
      0
    )
  }
  return null
}

function hue2rgb(h: number, c: number, x: number) {
  if (h < 60) return [c, x, 0]
  if (h < 120) return [x, c, 0]
  if (h < 180) return [0, c, x]
  if (h < 240) return [0, x, c]
  if (h < 300) return [x, 0, c]
  return [c, 0, x]
}

function hslToRgb(h: number, s: number, l: number) {
  const C = (1 - Math.abs(2 * l - 1)) * s
  const X = C * (1 - Math.abs(((h / 60) % 2) - 1))
  const M = l - C / 2
  const [R1, G1, B1] = hue2rgb(h, C, X)
  return (
    (Math.round((R1 + M) * 255) << 24) |
    (Math.round((G1 + M) * 255) << 16) |
    (Math.round((B1 + M) * 255) << 8)
  )
}

function parse255(str: string) {
  const int = parseInt(str, 10)
  if (int < 0) return 0
  if (int > 255) return 255
  return int
}

function parse360(str: string) {
  const int = parseFloat(str)
  return (((int % 360) + 360) % 360) / 360
}

function parse1(str: string) {
  const num = parseFloat(str)
  if (num < 0) return 0
  if (num > 1) return 255
  return Math.round(num * 255)
}

function parsePercentage(str: string) {
  // parseFloat conveniently ignores the final %
  const int = parseFloat(str)
  if (int < 0) return 0
  if (int > 100) return 1
  return int / 100
}
