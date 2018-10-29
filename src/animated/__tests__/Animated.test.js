import Animated from './../Animated'

let TestedClass = new Animated()

describe('Animated', () => {
  beforeEach(() => {
    TestedClass = new Animated()
  })

  it('instantiates', () => {
    expect(TestedClass).toBeTruthy()
  })
})
