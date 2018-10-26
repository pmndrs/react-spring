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
    expect(TestedClass.children.length).toEqual(0)
    expect(TestedClass.children.length).not.toEqual(5)
  })

  it('adds children', () => {
    const spy = jest.spyOn(AnimatedWithChildren.prototype, 'attach')
    expect(TestedClass.children.length).toEqual(0)
    TestedClass.addChild({ child: 'child' })
    expect(TestedClass.children.length).toEqual(1)
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it('removes children', () => {
    const anim = new Animated()
    TestedClass.addChild(anim)
    TestedClass.removeChild(anim)
    expect(TestedClass.children.length).toEqual(0)
  })
})
