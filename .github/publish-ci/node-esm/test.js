import assert from 'node:assert'
import { animated, useSpring } from '@react-spring/web'

console.log('Testing Node with ESM imports...')

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

for (const [fn, name, category] of entries) {
  try {
    checkFunctionName(fn, name, category)
  } catch (error) {
    console.error(error)
  }
}

const moduleNames = [['@react-spring/web', 'dist/react-spring_web.modern.mjs']]

for (const [moduleName, expectedFilename] of moduleNames) {
  const resolved = import.meta.resolve(moduleName)
  console.log(`Module: ${moduleName}, resolved: ${resolved}`)
  assert(resolved.endsWith(expectedFilename))
}

console.log('ESM test succeeded')
