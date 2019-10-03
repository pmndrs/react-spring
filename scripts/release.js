const { prompt } = require('enquirer')
const chalk = require('chalk')
const execa = require('execa')
const sade = require('sade')
const path = require('path')

const lernaBin = './node_modules/.bin/lerna'

sade('release', true)
  .version('1.0.0')
  .describe('Release a version')
  .option('--canary', 'Release the last commit without a tag')
  .option('--no-commit', 'Release the current version as-is')
  .option('--no-clean', 'Skip "yarn clean" for faster publishing')
  .action(opts => {
    process.chdir(path.dirname(__dirname))
    return opts.canary ? publishCanary(opts) : publish()
  })
  .parse(process.argv)
  .catch(err => {
    if (!err.command) {
      console.error(err)
    } else if (err.stderr) {
      console.error(err.stderr)
    }
    process.exit(1)
  })

async function publish() {
  exec(`${lernaBin} version`)
  updateLockfile()
  exec(`${lernaBin} publish`)
}

async function publishCanary(opts) {
  if (opts.commit !== false) {
    const lastVersion = require('../lerna.json').version
    const match =
      /([^-]+)(?:-canary\.([^\.]+)\.([^\.]+))?/.exec(lastVersion) || []

    let version = await ask('Version', match[1])

    const pr = await ask('PR number', match[2])
    const build = await ask('Build number', Number(match[3] || 0) + 1)

    const head = exec('git rev-parse HEAD', { silent: true }).stdout
    const commit = await ask('Commit hash', head.slice(0, 7))

    // Create the version commit.
    version = `${version}-canary.${pr}.${build}.${commit}`
    exec(`${lernaBin} version ${version} --yes`)

    updateLockfile(opts)
  }

  // Publish the canary with a temporary tag.
  const publishCmd = `cd dist && npm publish --tag tmp && npm dist-tag rm \\$LERNA_PACKAGE_NAME tmp`
  exec(`${lernaBin} exec -- ${publishCmd}`)
}

function updateLockfile(opts = {}) {
  // Ensure "yarn.lock" is up-to-date.
  if (opts.clean !== false) exec(`yarn clean`)
  exec(`yarn --force`)

  // Merge the "yarn.lock" changes into the version commit.
  exec(`git add yarn.lock`)
  exec(`git commit --amend --no-edit`)

  // Ensure the "dist" directories are in good condition.
  exec(`yarn prepare`)
}

function exec(cmd, { silent } = {}) {
  cmd = cmd.trim().replace(/\n  /g, '\n')
  if (!silent) console.log(`\nExecuting command:\n  ${chalk.green(cmd)}\n`)
  cmd = cmd.split(/[\s]+/g)
  return execa.sync(cmd[0], cmd.slice(1), {
    stdio: silent ? 'pipe' : 'inherit',
  })
}

async function ask(message, initial) {
  const { value } = await prompt({
    type: 'input',
    name: 'value',
    message,
    initial,
  })
  return value
}
