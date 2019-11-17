import { AnimationConfig } from './Animation'

describe('AnimationConfig', () => {
  describe('merge', () => {
    it('should convert frequency and damping vars to appropriate tension and friction ', () => {
      const config = new AnimationConfig()
      config.merge({ frequency: 0.5, damping: 1 })
      expect(config.tension).toBe(157.91367041742973)
      expect(config.friction).toBe(25.132741228718345)
    })

    it('should still work with extreme but valid values', () => {
      const config = new AnimationConfig()
      config.merge({ frequency: 2.6, damping: 0.1 })
      expect(config.tension).toBe(5.840002604194885)
      expect(config.friction).toBe(0.483321946706122)
    })
    it('should guard against a damping ratio that is less than 0', () => {
      const invalidConfig = new AnimationConfig()
      invalidConfig.merge({ frequency: 0.5, damping: -1 })
      const validConfig = new AnimationConfig()
      validConfig.merge({ frequency: 0.5, damping: 0 })

      expect(invalidConfig.tension).toBe(validConfig.tension)
      expect(invalidConfig.friction).toBe(validConfig.friction)
    })

    it('should guard against a frequency response that is less than or equal to 0', () => {
      const invalidConfig = new AnimationConfig()
      invalidConfig.merge({ frequency: 0, damping: 1 })
      const validConfig = new AnimationConfig()
      validConfig.merge({ frequency: 0.01, damping: 1 })

      expect(invalidConfig.tension).toBe(validConfig.tension)
      expect(invalidConfig.friction).toBe(validConfig.friction)
    })
  })
})
