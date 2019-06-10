const sortPackageJson = require('sort-package-json')
const rimraf = require('rimraf')
const path = require('path')
const fs = require('fs-extra')

build()

function build() {
  process.chdir(path.resolve(__dirname, '..'))

  // Delete previous builds.
  rimraf.sync('dist/src')

  // Avoid bundling the "src" directory, because we want proper
  // sourcemap support when using Metro.
  fs.copySync('src', 'dist/src')
  fs.copySync('tsconfig.json', 'dist/tsconfig.json')

  // Copy uncompiled source code from "@react-spring/core"
  // into "dist" so Metro can provide proper sourcemaps.
  copyPackage('../../packages/core', 'dist/src/core')

  // We need to move embedded dependencies after they're installed.
  fs.copySync('scripts/_postinstall.js', 'dist/postinstall.js')

  // Remove any test files.
  rimraf.sync('dist/src/**/__tests__')
  rimraf.sync('dist/src/**/*.test.ts')
}

function copyPackage(fromPath, toPath) {
  fs.copySync(path.join(fromPath, 'src'), toPath)
  const { name, version } = fs.readJsonSync(path.join(fromPath, 'package.json'))
  const json = { name, version, private: true, main: 'index.ts' }
  const jsonPath = path.join(toPath, 'package.json')
  fs.writeJsonSync(jsonPath, json, { spaces: '  ' })
}
