const path = require('path')

/** @type {import('jest').Config} */
module.exports = {
  setupFilesAfterEnv: [path.join(__dirname, 'packages/core/test/setup.ts')],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: [
    '.+/(types|__snapshots__)/.+',
    '<rootDir>/node_modules/',
    '<rootDir>/.github/',
  ],
  modulePathIgnorePatterns: ['dist', 'cypress'],
  moduleNameMapper: {
    '^react$': '<rootDir>/node_modules/react',
    '@react-spring/(.*)': '<rootDir>/packages/$1/src/index.ts',
  },
  collectCoverageFrom: [
    '<rootDir>/packages/{animated,core,rafz,shared}/src/*.{ts,tsx}',
    '<rootDir>/targets/{web}/src/*.{ts,tsx}',
  ],
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
  fakeTimers: { enableGlobally: true },
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
}
