const fs = require('fs-extra')
const { crawl } = require('recrawl')
const sortPackageJson = require('sort-package-json')
const { relative, resolve, join, dirname } = require('path')
const chalk = require('chalk')

const { log } = console

const distId = 'dist'

// Packages with no "dist" folder
const rawPackages = ['packages/envinfo']

// Root "package.json" fields to merge
const mergedFields = [
  'license',
  'dependencies',
  'publishConfig',
  'author',
  'contributors',
  'keywords',
  'bugs',
]

// Root "package.json" fields to use when undefined
const defaultFields = ['description', 'sideEffects']

// "package.json" fields to delete
const deletedFields = {
  shared: ['main', 'module', 'keywords', 'description'],
}

// "package.json" fields to override
const forcedFields = {
  'react-spring': {
    main: 'web.cjs.js',
    module: 'web.js',
  },
}

// Files to copy from root directory into each package
const inheritedFiles = ['LICENSE']

// Files to copy from package root into "dist" directory
const ownFiles = ['README.md', '@types']

const union = (a, b) => Array.from(new Set(a.concat(b)))
const isObject = x => !!x && x.constructor.name === 'Object'
const { isArray } = Array

const PJ = 'package.json'

const getWorkspaces = async rootJson =>
  (await crawl('.', {
    only: rootJson.workspaces.packages.map(path => join(path, PJ)),
    skip: ['.*', 'node_modules'].concat(rawPackages),
  })).map(dirname)

// Executed by "lerna publish" and "lerna bootstrap"
async function prepare() {
  process.chdir(resolve(__dirname, '..'))
  const rootJson = await fs.readJson(PJ)
  const dirs = await getWorkspaces(rootJson)
  const names = []
  const packages = {}

  // Read the "package.json" of each workspace
  for (const dir of dirs) {
    const json = await fs.readJson(join(dir, PJ))
    packages[json.name] = json
    names.push(json.name)
  }

  // Ensure all "dist" directories exist.
  dirs.forEach(dir => fs.ensureDirSync(join(dir, distId)))

  log(``)
  for (let i = 0; i < names.length; i++) {
    const dir = dirs[i]
    const name = names[i]
    const json = packages[name]
    log(chalk.cyan(json.name))
    log(`  rootDir: %O`, dir)
    log(`  version: %O`, json.version)
    log(``)

    json.homepage = rootJson.homepage
    if (name !== 'react-spring') {
      json.homepage = json.homepage.replace(
        '#readme',
        `/tree/master/${dir}#readme`
      )
    }

    // Be gone dev-only fields!
    delete json.private
    delete json.scripts
    delete json.devDependencies
    delete json.types

    // Add "postinstall" script for donations.
    if (/(native|core)$/.test(name))
      json.scripts = {
        postinstall:
          'node -e "console.log(\'\\u001b[35m\\u001b[1mEnjoy react-spring? You can now donate to our open collective:\\u001b[22m\\u001b[39m\\n > \\u001b[34mhttps://opencollective.com/react-spring/donate\\u001b[0m\')"',
      }

    const deps = json.dependencies
    if (name.endsWith('native')) {
      // Since we embed "core" into "native", we need its dependencies.
      Object.assign(deps, packages['@react-spring/core'].dependencies)
      delete deps['@react-spring/core']

      // Include "typescript" in devDependencies
      const rootDeps = rootJson.devDependencies
      json.devDependencies = {
        typescript: rootDeps.typescript,
      }

      // Run "postinstall" script to prepare private packages
      json.scripts = { postinstall: 'node postinstall.js' }

      // Copy babel config for bundlers to find
      const configId = 'babel.config.js'
      await fs.copy(configId, join(dir, distId, configId))
    }
    // Non-native config
    else {
      json.main = json.main.replace(/^dist\//, '')
      if (json.main.endsWith('.cjs.js')) {
        json.module = json.main.replace('.cjs', '')
      }
    }

    // Update the versions of "@react-spring/*" dependencies.
    if (deps)
      for (const dep in deps) {
        if (dep.startsWith('@react-spring/')) {
          deps[dep] = '^' + packages[dep].version

          // Link "dist" packages together.
          const linkDir = join(dir, distId, 'node_modules')
          const linkPath = join(linkDir, dep)
          const depIndex = names.findIndex(name => name === dep)
          const depPath = join(dirs[depIndex], distId)
          fs.removeSync(linkPath)
          fs.ensureSymlinkSync(depPath, linkPath)
        }
      }

    for (const field of mergedFields) {
      const value = json[field]
      const rootValue = rootJson[field]
      if (isObject(rootValue)) {
        json[field] = isObject(value) ? { ...value, ...rootValue } : rootValue
      } else if (isArray(rootValue)) {
        json[field] = isArray(value) ? union(value, rootValue) : rootValue
      } else {
        json[field] = rootValue
      }
    }

    for (const field of defaultFields) {
      if (json[field] == null) {
        json[field] = rootJson[field]
      }
    }

    if (dir in deletedFields)
      deletedFields[dir].forEach(field => {
        delete json[field]
      })

    if (dir in forcedFields) {
      const fields = forcedFields[dir]
      for (const field in fields) {
        json[field] = fields[field]
      }
    }

    // Save the dist-only "package.json"
    const distDir = join(dir, distId)
    await fs.ensureDir(distDir)
    await fs.writeJson(join(distDir, PJ), sortPackageJson(json), {
      spaces: '  ',
    })

    // Copy any dist-only files.
    for (const file of inheritedFiles) {
      await fs.copy(file, join(distDir, file))
    }
    for (const file of ownFiles) {
      const srcPath = join(dir, file)
      const distPath = join(distDir, file)
      try {
        await fs.remove(distPath)
        if ((await fs.lstat(srcPath)).isDirectory()) {
          await fs.copy(srcPath, distPath)
        } else {
          const buf = await fs.readFile(srcPath)
          await fs.writeFile(distPath, buf)
        }
      } catch {}
    }
  }
}

prepare().catch(console.error)
