import normalizeColor from 'normalize-css-color'

var linear = t => t

/**
 * Very handy helper to map input ranges to output ranges with an easing
 * function and custom behavior outside of the ranges.
 */
export default class Interpolation {
    static create(config) {
        if (typeof config === 'function') return (...args) => config(...args)
        if (config.output && typeof config.output[0] === 'string') return createInterpolationFromStringOutputRange(config)
        var outputRange = config.output
        var inputRange = config.range
        var easing = config.easing || linear
        var extrapolateLeft = 'extend'

        if (config.extrapolateLeft !== undefined) {
            extrapolateLeft = config.extrapolateLeft
        } else if (config.extrapolate !== undefined) {
            extrapolateLeft = config.extrapolate
        }

        var extrapolateRight = 'extend'

        if (config.extrapolateRight !== undefined) {
            extrapolateRight = config.extrapolateRight
        } else if (config.extrapolate !== undefined) {
            extrapolateRight = config.extrapolate
        }

        return input => {
            var range = findRange(input, inputRange)
            return interpolate(
                input,
                inputRange[range],
                inputRange[range + 1],
                outputRange[range],
                outputRange[range + 1],
                easing,
                extrapolateLeft,
                extrapolateRight,
            )
        }
    }
}

function interpolate(input, inputMin, inputMax, outputMin, outputMax, easing, extrapolateLeft, extrapolateRight) {
    var result = input

    // Extrapolate
    if (result < inputMin) {
        if (extrapolateLeft === 'identity') {
            return result
        } else if (extrapolateLeft === 'clamp') {
            result = inputMin
        } else if (extrapolateLeft === 'extend') {
            // noop
        }
    }

    if (result > inputMax) {
        if (extrapolateRight === 'identity') {
            return result
        } else if (extrapolateRight === 'clamp') {
            result = inputMax
        } else if (extrapolateRight === 'extend') {
            // noop
        }
    }

    if (outputMin === outputMax) return outputMin
    if (inputMin === inputMax) {
        if (input <= inputMin) return outputMin
        return outputMax
    } // Input Range

    if (inputMin === -Infinity) {
        result = -result
    } else if (inputMax === Infinity) {
        result = result - inputMin
    } else {
        result = (result - inputMin) / (inputMax - inputMin)
    } // Easing

    result = easing(result) // Output Range

    if (outputMin === -Infinity) {
        result = -result
    } else if (outputMax === Infinity) {
        result = result + outputMin
    } else {
        result = result * (outputMax - outputMin) + outputMin
    }
    return result
}

function colorToRgba(input) {
    var int32Color = normalizeColor(input)
    if (int32Color === null) return input
    int32Color = int32Color || 0 // $FlowIssue
    var r = (int32Color & 0xff000000) >>> 24
    var g = (int32Color & 0x00ff0000) >>> 16
    var b = (int32Color & 0x0000ff00) >>> 8
    var a = (int32Color & 0x000000ff) / 255
    return `rgba(${r}, ${g}, ${b}, ${a})`
}

var stringShapeRegex = /[0-9\.-]+/g

/**
 * Supports string shapes by extracting numbers so new values can be computed,
 * and recombines those values into new strings of the same shape.  Supports
 * things like:
 *
 *   rgba(123, 42, 99, 0.36) // colors
 *   -45deg                  // values with units
 */
function createInterpolationFromStringOutputRange(config) {
    var outputRange = config.output
    outputRange = outputRange.map(colorToRgba)

    // ->
    // [
    //   [0, 50],
    //   [100, 150],
    //   [200, 250],
    //   [0, 0.5],
    // ]

    /* $FlowFixMe(>=0.18.0): `outputRange[0].match()` can return `null`. Need to
   * guard against this possibility.
   */
    var outputRanges = outputRange[0].match(stringShapeRegex).map(() => [])
    outputRange.forEach(value => {
        /* $FlowFixMe(>=0.18.0): `value.match()` can return `null`. Need to guard
     * against this possibility.
     */
        value.match(stringShapeRegex).forEach((number, i) => outputRanges[i].push(+number))
    })

    /* $FlowFixMe(>=0.18.0): `outputRange[0].match()` can return `null`. Need to
     * guard against this possibility.
     */
    var interpolations = outputRange[0].match(stringShapeRegex).map((value, i) => {
        return Interpolation.create({ ...config, output: outputRanges[i] })
    })

    // rgba requires that the r,g,b are integers.... so we want to round them, but we *dont* want to
    // round the opacity (4th column).
    const shouldRound = /^rgb/.test(outputRange[0])
    return input => {
        var i = 0 // 'rgba(0, 100, 200, 0)'
        // ->
        // 'rgba(${interpolations[0](input)}, ${interpolations[1](input)}, ...'
        return outputRange[0].replace(stringShapeRegex, () => {
            const val = interpolations[i++](input)
            return String(shouldRound && i < 4 ? Math.round(val) : val)
        })
    }
}

function findRange(input, inputRange) {
    for (var i = 1; i < inputRange.length - 1; ++i) if (inputRange[i] >= input) break
    return i - 1
}
