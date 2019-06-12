const fs = require('fs')
const path = require('path')
const mkdir = dir => fs.existsSync(dir) || fs.mkdirSync(dir)
const checkPath = file => fs.existsSync(file) && file

// Link "node_modules/shared" to wherever "@react-spring/shared" can be found.
createAlias('shared', '@react-spring/shared')

function createAlias(alias, target) {
  target =
    // Look for "node_modules/@react-spring/{self}/node_modules/{target}"
    checkPath(path.join(__dirname, 'node_modules', target)) ||
    // Look for "node_modules/{target}"
    checkPath(path.resolve(__dirname, '../..', target))

  if (target) {
    let origin = path.join(__dirname, 'node_modules')
    mkdir(origin)
    target = path.relative(origin, target)
    origin = path.join(origin, alias)
    fs.symlinkSync(target, origin)
  }
}
