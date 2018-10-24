import Animated from './../../src/animated/Animated'
import AnimatedWithChildren from './../../src/animated/AnimatedWithChildren'

let TestedClass = new AnimatedWithChildren()

describe('AnimatedWithChildren', () => {
  beforeEach(() => {
    TestedClass = new AnimatedWithChildren()
  })

  it('instantiates', () => {
    expect(TestedClass).toBeTruthy()
  })

  it('has no children to start', () => {
    expect(TestedClass._children.length).toEqual(0)
    expect(TestedClass._children.length).not.toEqual(5)
  })

  it('adds children', () => {
    const spy = jest.spyOn(AnimatedWithChildren.prototype, '__attach')
    expect(TestedClass._children.length).toEqual(0)
    TestedClass.__addChild({ child: 'child' })
    expect(TestedClass._children.length).toEqual(1)
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it('removes children', () => {
    const anim = new Animated()
    TestedClass.__addChild(anim)
    TestedClass.__removeChild(anim)
    expect(TestedClass._children.length).toEqual(0)
  })
})
