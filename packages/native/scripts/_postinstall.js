// This script is copied into the "dist" package.
const fs = require('fs-extra')

const CORE_ID = '@react-spring/core'
const SHARED_ID = 'shared'

// Move the "src/core" and "src/shared" packages into the local
// "node_modules" directory, because npm doesn't play nicely.
fs.moveSync('src/core', 'node_modules/' + CORE_ID)
fs.moveSync('src/shared', 'node_modules/' + SHARED_ID)

const json = fs.readJsonSync('package.json')
// Help bundlers find our private packages.
json.dependencies[CORE_ID] = '*'
json.dependencies[SHARED_ID] = '*'
// The bundler handles babel stuff.
delete json.dependencies['@babel/runtime']
fs.writeJsonSync('package.json', json, { spaces: '  ' })
