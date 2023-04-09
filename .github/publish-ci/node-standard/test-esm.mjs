import assert from 'node:assert'
import path from 'path'
import { importMetaResolve } from 'resolve-esm'
import { animated, useSpring } from 'react-spring'

console.log('Testing Node with ESM imports...')

function checkFunctionName(fn, name, category) {
  console.log(`Checking ${category} '${name}' === '${fn.name}'`)
  assert(
    fn.name === name,
    `${category} \`${name}\` did not import correctly (name: '${fn.name}')`
  )
}

const entries = [
  [animated, 'animated', 'react-spring'],
  [useSpring, 'useSpring', 'react-spring'],
]

for (let [fn, name, category] of entries) {
  try {
    checkFunctionName(fn, name, category)
  } catch (error) {
    console.error(error)
  }
}

const moduleNames = [['react-spring', 'dist/index.js']]

;(async () => {
  for (let [moduleName, expectedFilename] of moduleNames) {
    const modulePath = await importMetaResolve(moduleName)
    const posixPath = modulePath.split(path.sep).join(path.posix.sep)
    console.log(`Module: ${moduleName}, path: ${posixPath}`)
    assert(posixPath.endsWith(expectedFilename))
  }
})()
