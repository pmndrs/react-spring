#! /usr/bin/env node
const { argv } = require('yargs') // 12.x
const unquote = require('unquote')
const chalk = require('chalk') // 2.x
const execa = require('execa') // 1.x
const path = require('path')
const fs = require('fs-extra') // 6.x

const NPM_BIN = './node_modules/.bin'.replace(/\//g, path.sep)
const BUILD_DIR = 'dist'

const run = (...scripts) =>
  Promise.all(
    scripts.map(async script => {
      if (!script) return
      if (typeof script === 'string') {
        let [cmd, ...args] = script.trim().split(' ')
        args = args.map(unquote)

        if (cmd !== 'npm') {
          cmd = path.join(NPM_BIN, cmd)
        }

        console.log(chalk.gray('$ ' + cmd + ' ' + args.join(' ')))
        await execa(cmd, args, { stdio: 'inherit' })
      }
    })
  )

const toArray = val => (val == null ? [] : Array.isArray(val) ? val : [val])
const getRollupArgv = () => {
  const onlyArgs = toArray(argv.only).concat(argv.t || [])
  const notArgs = toArray(argv.not).concat(argv.n || [])
  return [
    ...(!!argv.watch ? ['--watch'] : []),
    ...onlyArgs.map(target => '--config-only ' + target),
    ...notArgs.map(target => '--config-not ' + target),
    '--config-cookbook ' + (!onlyArgs.length && argv.cookbook !== false),
    '--config-renderprops ' + (!onlyArgs.length && argv.renderprops !== false),
  ]
}

async function build() {
  // Files copied into the $BUILD_DIR
  const files = ['package.json', 'readme.md', 'LICENSE']

  // Copy some metadata
  await run(`cpx {${files.join(',')}} ${BUILD_DIR}`)

  // Prepare the package.json for publishing
  const oldJson = await preparePackageJson()

  // Copy the types
  await run(oldJson.scripts['copy:ts'])

  // Bundle the modules
  await run(`rollup -c ${getRollupArgv().join(' ')}`)
}

async function preparePackageJson() {
  const packagePath = path.join(BUILD_DIR, 'package.json')
  const oldJson = await fs.readJson(packagePath)

  await fs.writeJson(packagePath, {
    ...oldJson,
    private: false,
    devDependencies: undefined,
    optionalDependencies: undefined,
    scripts: undefined,
    husky: undefined,
    prettier: undefined,
    jest: undefined,
  })

  return oldJson
}

build().catch(console.error)
