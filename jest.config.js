module.exports = {
  collectCoverageFrom: ['**/src/**/*', '!**/dist/**/*', '!**/*.json'],
  coverageDirectory: './coverage',
  coverageReporters: ['json', 'html', 'text'],
  moduleNameMapper: {
    '^shared$': '<rootDir>/packages/shared/src/index',
    '^shared/(.*)': '<rootDir>/packages/shared/src/$1',
  },
  modulePathIgnorePatterns: ['.+/(dist|docs|examples)'],
  testPathIgnorePatterns: ['.+/types/.+'],
  testMatch: ['**/*.test.*'],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
}
