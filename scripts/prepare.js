const { relative, resolve, join, dirname } = require('path')
const { rewritePaths } = require('typescript-rewrite-paths')
const { crawl } = require('recrawl-sync')
const sortPackageJson = require('sort-package-json')
const chalk = require('chalk')
const fs = require('fs-extra')

const { log } = console
const { isArray } = Array

const union = (a, b) => Array.from(new Set(a.concat(b)))
const isObject = x => !!x && x.constructor.name === 'Object'

const SRC = 'src'
const DIST = 'dist'
const PJ = 'package.json'
const RS = '@react-spring'

// Packages compatible with react-native
const RN_PKG = /\/(native|addons|core|animated)$/

// Packages with no "dist" folder
const rawPackages = ['packages/envinfo']

const lernaJson = fs.readJsonSync('lerna.json')

// Read all "package.json" modules in advance.
const readPackages = rootJson =>
  crawl('.', {
    only: rootJson.workspaces.packages.map(path => join(path, PJ)),
    skip: ['.*', 'node_modules'].concat(rawPackages),
  }).reduce((packages, pkgJsonPath) => {
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
  const packages = readPackages(rootJson)

  // Package-specific fields to delete
  const deletions = {
    [`${RS}/shared`]: ['keywords'],
  }

  // Package-specific fields to override
  // const overrides = {}

  // Entry module overrides
  const entryOverrides = {
    [`${RS}/shared`]: {
      main: 'index.js',
    },
  }

  // The pipeline of changes
  const preparePackage = async pkg => {
    const { postinstall } = pkg.scripts || {}
    deleteFields(pkg, ['private', 'scripts', 'devDependencies'])
    if (postinstall) setScript(pkg, 'postinstall', postinstall)
    useDefaultFields(pkg, ['description', 'sideEffects'])
    useFields(pkg, [
      'license',
      'dependencies',
      'author',
      'contributors',
      'keywords',
      'bugs',
    ])
    pkg.version = lernaJson.version
    pkg.publishConfig = rootJson.publishConfig
    setHomepage(pkg)
    setEntryModules(pkg)
    await rewriteLocalDeps(pkg)
    useOwnFiles(pkg, ['README.md', '@types'])
    useFiles(pkg, ['LICENSE'])
    deleteFields(pkg, deletions[pkg.name])
    // assignFields(pkg, overrides[pkg.name])
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
    const overrides = entryOverrides[pkg.name] || {}
    const main = overrides.main || pkg.main
    if (!main) {
      throw Error('pkg.main must exist')
    }

    const srcDir = new RegExp(`^${SRC}/`)
    const tsxExt = /\.tsx?$/

    pkg.main =
      overrides.main || main.replace(srcDir, '').replace(tsxExt, '.cjs.js')
    pkg.module =
      overrides.module ||
      (pkg.main.endsWith('.cjs.js') ? pkg.main.replace(/\.cjs\./, '.') : void 0)
    pkg.types =
      overrides.types ||
      (pkg.types || tsxExt.test(main)
        ? (pkg.types || main.replace(tsxExt, '.d.ts')).replace(srcDir, '')
        : void 0)

    // Packages compatible with "react-native" provide an uncompiled main module.
    if (RN_PKG.test(pkg.name)) {
      pkg['react-native'] = main
    }
  }

  // Publish the source code for sourcemaps and for bundlers
  // (like Metro) that ignore pre-existing sourcemaps.
  const copySourceFiles = async (pkg, rewritePath) => {
    if (pkg.name == 'react-spring') return
    if (pkg.name.endsWith('shared')) return
    const srcDir = join(pkg.dir, SRC)
    const distDir = join(pkg.dir, DIST, SRC)

    // Include "typescript" in devDependencies
    const rootDeps = rootJson.devDependencies
    pkg.devDependencies = {
      typescript: rootDeps.typescript,
    }

    // Copy every "src" module (except for tests and declarations)
    const files = crawl(srcDir, {
      skip: ['*.d.ts', '*.test.*', '__(tests|fixtures|mocks|snapshots)__'],
    })
    files.forEach(file => {
      let content = fs.readFileSync(join(srcDir, file), 'utf8')
      if (rewritePath && /\.[tj]sx?$/.test(file)) {
        content = rewritePaths(content, rewritePath)
      }
      const distPath = join(distDir, file)
      fs.ensureDirSync(dirname(distPath))
      fs.writeFileSync(distPath, content)
    })
  }

  // Read the package.json of a local dependency
  const readLocalDep = (pkg, localVersion) => {
    if (localVersion.startsWith('link:')) {
      const pkgJsonPath = resolve(pkg.dir, localVersion.slice(5), PJ)
      return fs.readJsonSync(pkgJsonPath)
    }
  }

  // Rename dependency aliases to their full "@react-spring/xxx" name,
  // and replace "link:" versions with actual versions
  const rewriteLocalDeps = async pkg => {
    await copySourceFiles(pkg, path => {
      const deps = pkg.dependencies
      if (deps) {
        for (const localId in deps) {
          const dep = readLocalDep(pkg, deps[localId])
          if (!dep) continue
          if (path == localId || path.startsWith(localId + '/')) {
            return path.replace(localId, dep.name)
          }
        }
      }
    })

    // Replace "link:" versions with (A) exact versions for canary and beta releases,
    // or with (B) caret ranges for actual releases.
    const exactRE = /-(canary|beta)\./
    const deps = pkg.dependencies
    if (deps) {
      const names = Object.keys(packages)
      for (let localId in deps) {
        const localVersion = deps[localId]
        const { name: depId } = readLocalDep(pkg, localVersion) || {}

        const dep = packages[depId]
        if (dep) {
          const { version } = packages[depId]
          deps[depId] = (exactRE.test(version) ? '' : '^') + version
          if (localId !== depId) {
            delete deps[localId]
          }

          // Link "dist" packages together.
          const linkDir = join(pkg.dir, DIST, 'node_modules')
          const linkPath = join(linkDir, localId)
          const depIndex = names.findIndex(name => name === localId)
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

  log('')
  log(chalk.yellow(lernaJson.version))
  log('')
  await Promise.all(
    Object.keys(packages).map(name => {
      const pkg = packages[name]
      log(chalk.cyan(name))
      log('./' + pkg.dir)
      log('')
      return preparePackage(pkg)
    })
  )
}

prepare().catch(console.error)
