const fs = require('fs-extra')
const sortPackageJson = require('sort-package-json')
const { resolve, join } = require('path')

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
const ownFiles = ['README.md']

const union = (a, b) => Array.from(new Set(a.concat(b)))
const isObject = x => !!x && x.constructor.name === 'Object'
const { isArray } = Array

const PJ = 'package.json'

// Executed by "lerna publish" and "lerna bootstrap"
async function prepare() {
  process.chdir(resolve(__dirname, '..'))
  const local = (...paths) => join('packages', ...paths)

  // Directory names in "packages/*"
  const dirs = fs
    .readdirSync('packages')
    .filter(name => fs.statSync(local(name)).isDirectory())

  // Package names from each "package.json"
  const names = []

  // Metadata by package name
  const packages = {}
  for (const dir of dirs) {
    const json = await fs.readJson(local(dir, PJ))
    packages[json.name] = json
    names.push(json.name)
  }

  const rootJson = await fs.readJson(PJ)
  for (let i = 0; i < names.length; i++) {
    const dir = dirs[i]
    const name = names[i]
    const json = packages[name]

    json.homepage = rootJson.homepage
    if (dir !== 'react-spring')
      json.homepage = json.homepage.replace(
        '#readme',
        `/packages/${dir}#readme`
      )

    // Be gone dev-only fields!
    delete json.private
    delete json.scripts
    delete json.devDependencies

    const deps = json.dependencies
    if (dir == 'native') {
      // Since we embed "core" into "native", we need its dependencies.
      Object.assign(deps, packages['@react-spring/core'].dependencies)
      delete deps['@react-spring/core']
      json.scripts = { postinstall: 'node postinstall.js' }
    } else {
      // The default entry points
      json.main = 'index.cjs.js'
      json.module = 'index.js'
    }

    // Update the versions of "@react-spring/*" dependencies.
    if (deps)
      for (const name in deps) {
        if (name.startsWith('@react-spring/')) {
          deps[name] = '^' + packages[name].version
        }
      }

    if (dir == 'native') {
      // Include "typescript" in devDependencies
      const rootDeps = rootJson.devDependencies
      json.devDependencies = {
        typescript: rootDeps.typescript,
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
    const distPath = local(dir, 'dist')
    await fs.ensureDir(distPath)
    await fs.writeJson(join(distPath, PJ), sortPackageJson(json), {
      spaces: '  ',
    })

    // Copy any dist-only files.
    for (const file of inheritedFiles) {
      await fs.copy(file, join(distPath, file))
    }
    for (const file of ownFiles) {
      // Avoid "copy" in case of symlinks.
      const content = await fs.readFile(local(dir, file), 'utf8')
      await fs.writeFileSync(join(distPath, file), content)
    }
  }
}

prepare().catch(console.error)
