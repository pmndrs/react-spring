import _bezier from './bezier'

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
        return 1 - Math.cos(t * Math.PI / 2)
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
        return t => 1 - Math.cos(t * Math.PI / 2) ** 3 * Math.cos(t * p)
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
