const fs = require('fs-extra')
const path = require('path')
const { recrawl } = require('recrawl-sync')

const testMatch = ['**/*.test.*']
const ignoredPaths = ['.*', 'node_modules']
const findTests = recrawl({
  only: testMatch,
  skip: ignoredPaths,
})

const PJ = 'package.json'
const { packages } = fs.readJsonSync(PJ).workspaces
const findProjects = recrawl({
  only: packages.map(glob => path.join(glob, PJ)),
  skip: ignoredPaths,
})

module.exports = {
  projects: getProjects(),
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
}

function getProjects() {
  return findProjects('.')
    .map(jsonPath => path.resolve(jsonPath, '..'))
    .filter(dir => findTests(dir).length > 0)
    .map(createConfig)
}

function createConfig(rootDir) {
  const { compilerOptions } = fs.readJsonSync(
    path.join(rootDir, 'tsconfig.json')
  )

  return {
    rootDir,
    preset: 'ts-jest',
    setupFilesAfterEnv: [path.join(__dirname, 'packages/core/test/setup.ts')],
    testMatch,
    testEnvironment: 'jsdom',
    testPathIgnorePatterns: [
      '.+/(types|__snapshots__)/.+',
      '<rootDir>/node_modules/',
    ],
    modulePathIgnorePatterns: ['dist'],
    moduleNameMapper: {
      '^react$': '<rootDir>/../../node_modules/react',
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
    globals: {
      'ts-jest': {
        tsconfig: {
          ...compilerOptions,
        },
      },
    },
  }
}
