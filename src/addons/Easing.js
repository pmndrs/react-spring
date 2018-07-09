/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

const NEWTON_ITERATIONS = 4
const NEWTON_MIN_SLOPE = 0.001
const SUBDIVISION_PRECISION = 0.0000001
const SUBDIVISION_MAX_ITERATIONS = 10
const kSplineTableSize = 11
const kSampleStepSize = 1.0 / (kSplineTableSize - 1.0)
const float32ArraySupported = typeof Float32Array === 'function'

function A(aA1, aA2) {
  return 1.0 - 3.0 * aA2 + 3.0 * aA1
}

function B(aA1, aA2) {
  return 3.0 * aA2 - 6.0 * aA1
}

function C(aA1) {
  return 3.0 * aA1
} // Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.

function calcBezier(aT, aA1, aA2) {
  return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT
} // Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.

function getSlope(aT, aA1, aA2) {
  return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1)
}

function binarySubdivide(aX, aA, aB, mX1, mX2) {
  let currentX
  let currentT
  let i = 0

  do {
    currentT = aA + (aB - aA) / 2.0
    currentX = calcBezier(currentT, mX1, mX2) - aX

    if (currentX > 0.0) {
      aB = currentT
    } else {
      aA = currentT
    }
  } while (
    Math.abs(currentX) > SUBDIVISION_PRECISION &&
    ++i < SUBDIVISION_MAX_ITERATIONS
  )

  return currentT
}

function newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
  for (let i = 0; i < NEWTON_ITERATIONS; ++i) {
    const currentSlope = getSlope(aGuessT, mX1, mX2)

    if (currentSlope === 0.0) {
      return aGuessT
    }

    const currentX = calcBezier(aGuessT, mX1, mX2) - aX
    aGuessT -= currentX / currentSlope
  }

  return aGuessT
}

function _bezier(mX1, mY1, mX2, mY2) {
  if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) {
    // eslint-disable-line yoda
    throw new Error('bezier x values must be in [0, 1] range')
  } // Precompute samples table

  const sampleValues = float32ArraySupported
    ? new Float32Array(kSplineTableSize)
    : new Array(kSplineTableSize)

  if (mX1 !== mY1 || mX2 !== mY2) {
    for (let i = 0; i < kSplineTableSize; ++i) {
      sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2)
    }
  }

  function getTForX(aX) {
    let intervalStart = 0.0
    let currentSample = 1
    const lastSample = kSplineTableSize - 1

    for (
      ;
      currentSample !== lastSample && sampleValues[currentSample] <= aX;
      ++currentSample
    ) {
      intervalStart += kSampleStepSize
    }

    --currentSample // Interpolate to provide an initial guess for t

    const dist =
      (aX - sampleValues[currentSample]) /
      (sampleValues[currentSample + 1] - sampleValues[currentSample])
    const guessForT = intervalStart + dist * kSampleStepSize
    const initialSlope = getSlope(guessForT, mX1, mX2)

    if (initialSlope >= NEWTON_MIN_SLOPE) {
      return newtonRaphsonIterate(aX, guessForT, mX1, mX2)
    } else if (initialSlope === 0.0) {
      return guessForT
    } else {
      return binarySubdivide(
        aX,
        intervalStart,
        intervalStart + kSampleStepSize,
        mX1,
        mX2
      )
    }
  }

  return function BezierEasing(x) {
    if (mX1 === mY1 && mX2 === mY2) {
      return x // linear
    } // Because JavaScript number are imprecise, we should guarantee the extremes are right.

    if (x === 0) {
      return 0
    }

    if (x === 1) {
      return 1
    }

    return calcBezier(getTForX(x), mY1, mY2)
  }
}

class Easing {
  static step0(n) {
    return n > 0 ? 1 : 0
  }

  static step1(n) {
    return n >= 1 ? 1 : 0
  }

  static linear(t) {
    return t
  }

  static ease(t) {
    return ease(t)
  }

  static quad(t) {
    return t * t
  }

  static cubic(t) {
    return t * t * t
  }

  static poly(n) {
    return t => t ** n
  }

  static sin(t) {
    return 1 - Math.cos((t * Math.PI) / 2)
  }

  static circle(t) {
    return 1 - Math.sqrt(1 - t * t)
  }

  static exp(t) {
    return 2 ** (10 * (t - 1))
  }
  /**
   * A simple elastic interaction, similar to a spring.  Default bounciness
   * is 1, which overshoots a little bit once.  0 bounciness doesn't overshoot
   * at all, and bounciness of N > 1 will overshoot about N times.
   *
   * Wolfram Plots:
   *
   *   http://tiny.cc/elastic_b_1 (default bounciness = 1)
   *   http://tiny.cc/elastic_b_3 (bounciness = 3)
   */

  static elastic(bounciness = 1) {
    const p = bounciness * Math.PI
    return t => 1 - Math.cos((t * Math.PI) / 2) ** 3 * Math.cos(t * p)
  }

  static back(s) {
    if (s === undefined) s = 1.70158
    return t => t * t * ((s + 1) * t - s)
  }

  static bounce(t) {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t
    }
    if (t < 2 / 2.75) {
      t -= 1.5 / 2.75
      return 7.5625 * t * t + 0.75
    }
    if (t < 2.5 / 2.75) {
      t -= 2.25 / 2.75
      return 7.5625 * t * t + 0.9375
    }
    t -= 2.625 / 2.75
    return 7.5625 * t * t + 0.984375
  }

  static bezier(x1, y1, x2, y2) {
    return _bezier(x1, y1, x2, y2)
  }

  static in(easing) {
    return easing
  }

  /**
   * Runs an easing function backwards.
   */
  static out(easing) {
    return t => 1 - easing(1 - t)
  }

  /**
   * Makes any easing function symmetrical.
   */
  static inOut(easing) {
    return t => {
      if (t < 0.5) return easing(t * 2) / 2
      return 1 - easing((1 - t) * 2) / 2
    }
  }
}

var ease = Easing.bezier(0.42, 0, 1, 1)

export default Easing
