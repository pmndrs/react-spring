const fs = require('fs-extra')
const path = require('path')
const { recrawl } = require('recrawl-sync')
const { pathsToModuleNameMapper } = require('ts-jest/utils')

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
    setupFilesAfterEnv:
      rootDir.indexOf('shared') < 0
        ? [path.join(__dirname, 'packages/core/test/setup.ts')]
        : [],
    testMatch,
    testEnvironment: 'jsdom',
    testPathIgnorePatterns: ['.+/(types|__snapshots__)/.+'],
    modulePathIgnorePatterns: ['dist'],
    moduleNameMapper: {
      ...getModuleNameMapper(compilerOptions.paths),
      '^react$': '<rootDir>/../../node_modules/react',
    },
    collectCoverageFrom: ['src/**/*'],
    coverageDirectory: './coverage',
    coverageReporters: ['json', 'html', 'text'],
  }
}

function getModuleNameMapper(paths) {
  if (!paths) return
  const map = pathsToModuleNameMapper(paths)
  for (const key in map) {
    map[key] = map[key].replace('./', '<rootDir>/')
  }
  return map
}
