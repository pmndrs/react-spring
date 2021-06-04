const path = require('path')

module.exports = {
  preset: 'ts-jest',
  setupFilesAfterEnv: [path.join(__dirname, 'packages/core/test/setup.ts')],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: [
    '.+/(types|__snapshots__)/.+',
    '<rootDir>/node_modules/',
  ],
  modulePathIgnorePatterns: ['dist', 'cypress'],
  moduleNameMapper: {
    '^react$': '<rootDir>/node_modules/react',
  },
  collectCoverageFrom: ['src/**/*'],
  coverageDirectory: './coverage',
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 74,
      functions: 71,
      lines: 82,
    },
  },
  moduleFileExtensions: ['js', 'ts', 'tsx'],
  coverageReporters: ['json', 'html', 'text'],
  timers: 'fake',
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
}
