const { relative, resolve, join, dirname } = require('path')
const { crawl } = require('recrawl')
const sortPackageJson = require('sort-package-json')
const rimraf = require('rimraf')
const chalk = require('chalk')
const fs = require('fs-extra')

const { log } = console
const { isArray } = Array

const union = (a, b) => Array.from(new Set(a.concat(b)))
const isObject = x => !!x && x.constructor.name === 'Object'

const SRC = 'src'
const DIST = 'dist'
const PJ = 'package.json'

// Packages with no "dist" folder
const rawPackages = ['packages/envinfo']

// Read all "package.json" modules in advance.
const readPackages = async rootJson =>
  (await crawl('.', {
    only: rootJson.workspaces.packages.map(path => join(path, PJ)),
    skip: ['.*', 'node_modules'].concat(rawPackages),
  })).reduce((packages, pkgJsonPath) => {
    const pkgDir = dirname(pkgJsonPath)
    const pkg = fs.readJsonSync(pkgJsonPath)
    Object.defineProperty(pkg, 'dir', { value: pkgDir })
    fs.ensureDirSync(join(pkgDir, DIST))
    packages[pkg.name] = pkg
    return packages
  }, {})

// Executed by "lerna publish" and "lerna bootstrap"
async function prepare() {
  process.chdir(resolve(__dirname, '..'))
  const rootJson = await fs.readJson(PJ)
  const packages = await readPackages(rootJson)

  // Package-specific fields to delete
  const deletions = {
    '@react-spring/shared': ['keywords'],
  }

  // Package-specific fields to override
  const overrides = {
    'react-spring': {
      main: 'web.cjs.js',
      module: 'web.js',
    },
  }

  // The pipeline of changes
  const preparePackage = pkg => {
    const { postinstall } = pkg.scripts || {}
    deleteFields(pkg, ['private', 'scripts', 'devDependencies'])
    setScript(pkg, 'postinstall', postinstall)
    useDefaultFields(pkg, ['description', 'sideEffects'])
    useFields(pkg, [
      'license',
      'dependencies',
      'author',
      'contributors',
      'keywords',
      'bugs',
    ])
    pkg.publishConfig = rootJson.publishConfig
    setHomepage(pkg)
    setEntryModules(pkg)
    publishSources(pkg)
    prepareNativePackage(pkg)
    upgradeLocals(pkg)
    useOwnFiles(pkg, ['README.md', '@types'])
    useFiles(pkg, ['LICENSE'])
    deleteFields(pkg, deletions[pkg.name])
    assignFields(pkg, overrides[pkg.name])
    savePackage(pkg)
  }

  // Save the dist-only "package.json"
  const savePackage = pkg => {
    fs.ensureDirSync(join(pkg.dir, DIST))
    fs.writeJsonSync(join(pkg.dir, DIST, PJ), sortPackageJson(pkg), {
      spaces: '  ',
    })
  }

  const setHomepage = pkg => {
    pkg.homepage = rootJson.homepage
    if (pkg.name !== 'react-spring') {
      pkg.homepage = pkg.homepage.replace(
        '#readme',
        `/tree/master/${pkg.dir}#readme`
      )
    }
  }

  // Copy over "postinstall" scripts.
  const setScript = (pkg, name, script) => {
    if (!pkg.scripts) pkg.scripts = {}
    pkg.scripts[name] = script
  }

  // Ensure "package.json" points to the correct modules.
  const setEntryModules = pkg => {
    const DIST_RE = /^dist\//
    pkg.main = pkg.main.replace(DIST_RE, '')
    pkg.types = pkg.types.replace(DIST_RE, '')
    if (pkg.main.endsWith('.cjs.js')) {
      pkg.module = pkg.main.replace('.cjs', '')
    }
  }

  // Publish the source code for sourcemaps and for bundlers
  // (like Metro) that ignore pre-existing sourcemaps.
  const publishSources = pkg => {
    const distDir = join(pkg.dir, DIST)

    // Copy the "src" folder into the "dist" folder.
    fs.copySync(join(pkg.dir, SRC), join(distDir, SRC))

    // Remove any test files.
    rimraf.sync(join(distDir, SRC, '**/__tests__'))
    rimraf.sync(join(distDir, SRC, '**/*.test.*'))

    // Include "typescript" in devDependencies
    const rootDeps = rootJson.devDependencies
    pkg.devDependencies = {
      typescript: rootDeps.typescript,
    }
  }

  // Prepare packages that can be used in react-native.
  const prepareNativePackage = pkg => {
    if (/\/(native|core|animated|shared)$/.test(pkg.name)) {
      pkg['react-native'] = join(SRC, 'index.ts')
      pkg.scripts = { postinstall: 'node postinstall.js' }
      fs.copySync(
        'targets/native/scripts/postinstall.js',
        join(pkg.dir, DIST, 'postinstall.js')
      )
    }
  }

  // Update the versions of "@react-spring/*" dependencies.
  const upgradeLocals = pkg => {
    const deps = pkg.dependencies
    if (deps) {
      const names = Object.keys(packages)
      for (const depName in deps) {
        const dep = packages[depName]
        if (dep) {
          deps[depName] = '^' + packages[depName].version

          // Link "dist" packages together.
          const linkDir = join(pkg.dir, DIST, 'node_modules')
          const linkPath = join(linkDir, depName)
          const depIndex = names.findIndex(name => name === depName)
          const depPath = join(dep.dir, DIST)
          fs.removeSync(linkPath)
          fs.ensureSymlinkSync(depPath, linkPath)
        }
      }
    }
  }

  // Copy files from the monorepo root.
  const useFiles = (pkg, files) =>
    files.forEach(file => {
      fs.copySync(file, join(pkg.dir, DIST, file))
    })

  // Copy files from the package root.
  const useOwnFiles = (pkg, files) =>
    files.forEach(file => {
      const srcPath = join(pkg.dir, file)
      const distPath = join(pkg.dir, DIST, file)
      try {
        fs.removeSync(distPath)

        // Avoid copying symlinks.
        if (fs.lstatSync(srcPath).isDirectory()) {
          fs.copySync(srcPath, distPath)
        } else {
          fs.writeFileSync(distPath, fs.readFileSync(srcPath))
        }
      } catch {}
    })

  // Merge fields from the root "package.json"
  const useFields = (pkg, fields) =>
    fields.forEach(field => {
      const value = pkg[field]
      const rootValue = rootJson[field]
      if (isObject(rootValue)) {
        pkg[field] = isObject(value) ? { ...value, ...rootValue } : rootValue
      } else if (isArray(rootValue)) {
        pkg[field] = isArray(value) ? union(value, rootValue) : rootValue
      } else {
        pkg[field] = rootValue
      }
    })

  // Safely merge fields from the root "package.json"
  const useDefaultFields = (pkg, fields) =>
    fields.forEach(field => {
      if (pkg[field] == null) {
        pkg[field] = rootJson[field]
      }
    })

  const deleteFields = (pkg, fields) =>
    fields &&
    fields.forEach(field => {
      delete pkg[field]
    })

  const assignFields = (pkg, fields) =>
    fields &&
    Object.keys(fields).forEach(key => {
      pkg[key] = fields[key]
    })

  log(``)
  for (const name in packages) {
    const pkg = packages[name]
    log(chalk.cyan(name))
    log(`  rootDir: %O`, pkg.dir)
    log(`  version: %O`, pkg.version)
    log(``)
    preparePackage(pkg)
  }
}

prepare().catch(console.error)
