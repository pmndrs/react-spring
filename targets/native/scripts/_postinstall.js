const fs = require('fs')
const path = require('path')
const mkdir = name => fs.existsSync(name) || fs.mkdirSync(name)

process.chdir(__dirname)
mkdir('node_modules')

// Link "node_modules/shared" to "node_modules/@react-spring/shared"
const target = '@react-spring/shared'
fs.symlinkSync(target, 'node_modules/shared')
