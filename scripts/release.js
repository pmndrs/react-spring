const { prompt } = require('enquirer')
const chalk = require('chalk')
const execa = require('execa')
const sade = require('sade')
const path = require('path')

const lernaBin = './node_modules/.bin/lerna'

const cli = sade('release [version]', true)
  .version('1.0.0')
  .describe('Release a version')
  .option('--canary', 'Release the last commit without a tag')
  .option('--dry-run, -n', 'Disable side effects for testing')
  .option('--no-commit', 'Release the current version as-is')
  .option('--no-clean', 'Skip "yarn clean" for faster publishing')
  .action((version, opts) => {
    opts.dry = !!opts['dry-run']
    if (opts.dry) {
      console.warn('⚠️  NOTE: Dry run mode active.')
    }
    process.chdir(path.dirname(__dirname))
    return opts.canary ? publishCanary(opts) : publish(opts, version)
  })

Promise.resolve(cli.parse(process.argv)).catch(err => {
  if (!err.command) {
    console.error(err)
  } else if (err.stderr) {
    console.error(err.stderr)
  }
  process.exit(1)
})

function confirmPublish() {
  exec(`
    ${lernaBin} exec --concurrency 1 --stream
      -- cd dist
      && npm pack --dry-run
      && cat package.json
  `)
  console.log('\n')
  return ask('Ready to publish?', true)
}

async function publish(opts, version) {
  exec(`${lernaBin} version ${version}`)
  process.on('exit', () => {
    if (opts.dry) {
      const { stdout: tag } = exec('git describe --exact-match --abbrev=0', {
        silent: true,
      })
      deleteTag(tag)
      undoCommit()
    }
  })

  updateLockfile(opts)

  if (await confirmPublish()) {
    execDry(`${lernaBin} publish`, opts)
  }
}

async function publishCanary(opts) {
  // Publish the canary with a temporary tag.
  const publishUntagged = () =>
    exec(`
      ${lernaBin} exec
        -- cd dist
        && npm publish ${opts.dry ? '--dry-run' : '--tag tmp'}
        ${opts.dry ? '' : '&& npm dist-tag rm $LERNA_PACKAGE_NAME tmp'}
    `)

  if (opts.commit === false) {
    return publishUntagged()
  }

  const lastVersion = require('../lerna.json').version
  const match =
    /([^-]+)(?:-canary\.([^\.]+)\.([^\.]+))?/.exec(lastVersion) || []

  let version = await ask('Version', match[1])

  const pr = await ask('PR number', match[2])
  const build = await ask(
    'Build number',
    pr !== match[2] ? 1 : Number(match[3] || 0) + 1
  )

  const head = exec('git rev-parse HEAD', { silent: true }).stdout
  const commit = await ask('Commit hash', head.slice(0, 7))

  // Create the version commit.
  version = `${version}-canary.${pr}.${build}.${commit}`
  exec(`${lernaBin} version ${version} --yes`)

  let finished = false
  process.on('exit', () => {
    if (opts.dry || !finished) {
      deleteTag('v' + version)
      undoCommit(commit => commit == version)
    }
  })

  updateLockfile(opts)

  if (await confirmPublish()) {
    finished = true
    publishUntagged()
  }
}

function deleteTag(tag) {
  exec(`git tag -d ${tag}`)
}

function updateLockfile(opts = {}) {
  if (opts.clean !== false) {
    exec(`yarn clean`)
  }

  // Ensure "yarn.lock" is up-to-date.
  exec(`yarn --force`)

  // Merge the "yarn.lock" changes into the version commit.
  exec(`git add yarn.lock`)
  exec(`git commit --amend --no-edit`)
}

function undoCommit(shouldUndo) {
  if (shouldUndo) {
    // Pass the commit title to the `shouldUndo` function.
    const { stdout } = exec(`git --no-pager show -s --format=%s HEAD`, {
      silent: true,
    })
    if (!shouldUndo(stdout)) return
  }
  exec(`git reset --hard HEAD^`)
}

function execDry(cmd, opts) {
  if (opts.dry) {
    console.log(`\nSkipping command:\n  ${chalk.yellow(cmd)}\n`)
  } else {
    exec(cmd, opts)
  }
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
    type: typeof initial == 'boolean' ? 'confirm' : 'input',
    name: 'value',
    message,
    initial,
  })
  return value
}
