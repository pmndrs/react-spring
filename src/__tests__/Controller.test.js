import Controller from '../animated/Controller'

describe('Controller', function() {
  let c
  beforeAll(() => {
    c = new Controller({
      config: {
        tension: 170,
        friction: 26,
      },
      reset: false,
      delay: 0,
      native: true,
      to: { left: 0 },
      immediate: false,
      force: false,
    })
  })
  it('should throw when mixing strings and numbers', async () => {
    expect(() => {
      c.update({
        to: {
          left: '100%',
        },
      })
    }).toThrowErrorMatchingInlineSnapshot(`
"Invariant failed: it seems you're mixing numbers and strings in your inline styles for property \\"left\\".
 react-spring can only interpolate between the same type"
`)
  })

  it('should not throw', async () => {
    c.update({
      to: {
        left: 100,
      },
    })
  })
})
