#!/usr/bin/env node
const versions = {
  IDEs: ['VSCode'],
  System: ['OS'],
  Binaries: ['Node', 'Yarn', 'npm'],
  npmPackages: [].concat(
    'react',
    'react-dom',
    'react-native',
    'konva',
    'react-konva',
    'three',
    'react-three-fiber',
    'zdog',
    'react-zdog',
    'typescript',
    '@types/react',
    '@types/react-native',
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
