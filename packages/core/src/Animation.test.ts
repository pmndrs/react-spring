import { AnimationConfig } from './Animation'

const config = new AnimationConfig()

describe('AnimationConfig', () => {
  describe('merge', () => {
    it('should convert frequency and damping vars to appropriate tension and friction ', () => {
      config.merge({ mass: 1, frequency: 0.5, damping: 1 })
      expect(config.tension).toBe(157.91367041742973)
      expect(config.friction).toBe(25.132741228718345)
    })

    it('should still work with extreme but valid values', () => {
      config.merge({ mass: 1, frequency: 2.6, damping: 0.1 })
      expect(config.tension).toBe(5.840002604194885)
      expect(config.friction).toBe(0.483321946706122)
    })
  })
})
