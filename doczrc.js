const path = require('path')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

export default {
  protocol: 'http',
  title: 'react-spring',
  htmlContext: {
    head: {
      links: [
        {
          rel: 'stylesheet',
          href: 'https://codemirror.net/theme/dracula.css',
        },
      ],
    },
  },
  themeConfig: {
    codemirrorTheme: 'dracula',
    colors: {
      primary: '#ea567c',
      sidebarBg: 'white',
    },
    styles: {
      body: {
        fontFamily:
          '-apple-system, BlinkMacSystemFont, avenir next, avenir, helvetica neue, helvetica, ubuntu, roboto, noto, segoe ui, arial, sans-serif',
      },
      h1: {
        fontSize: '6em',
        fontWeight: 800,
      },
    },
  },
  modifyBundlerConfig: (config, dev, args) => {
    return {
      ...config,
      module: {
        ...config.module,
        rules: [
          ...config.module.rules,
          { test: () => true, sideEffects: true },
        ],
      },
    }
  },
}
