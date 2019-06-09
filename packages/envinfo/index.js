#!/usr/bin/env node
const versions = {
  IDEs: ['VSCode'],
  System: ['OS'],
  Binaries: ['Node', 'Yarn', 'npm'],
  npmPackages: [].concat(
    'typescript',
    'react-spring',
    [
      'addons',
      'animated',
      'core',
      'shared',
      'konva',
      'native',
      'three',
      'web',
      'zdog',
    ].map(name => '@react-spring/' + name)
  ),
}

const envinfo = require('envinfo')
envinfo
  .run(versions, {
    console: true,
  })
  .then(() => {
    const execa = require('execa')
    execa.sync('code', ['--list-extensions'], {
      stdio: 'inherit',
    })
  })
