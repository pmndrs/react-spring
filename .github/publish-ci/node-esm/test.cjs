const assert = require('node:assert')
const path = require('path')

const { animated, useSpring } = require('@react-spring/web')

console.log('Testing Node with CJS imports...')

function checkFunctionName(fn, name, category) {
  console.log(`Checking ${category} '${name}' === '${fn.name}'`)
  assert(
    fn.name === name,
    `${category} \`${name}\` did not import correctly (name: '${fn.name}')`
  )
}

const entries = [
  [animated, 'animated', '@react-spring/web'],
  [useSpring, 'useSpring', '@react-spring/web'],
]

for (let [fn, name, category] of entries) {
  try {
    checkFunctionName(fn, name, category)
  } catch (error) {
    console.error(error)
  }
}

const moduleNames = [['@react-spring/web', 'dist/cjs/index.js']]

for (let [moduleName, expectedFilename] of moduleNames) {
  const modulePath = require.resolve(moduleName)
  const posixPath = modulePath.split(path.sep).join(path.posix.sep)
  console.log(`Module: ${moduleName}, path: ${posixPath}`)
  assert(posixPath.endsWith(expectedFilename))
}

console.log('CJS test succeeded')
