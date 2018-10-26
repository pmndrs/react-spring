const path = require('path')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

console.log(path.resolve('./src/targets/web'))

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
      raw: `
      <style>
        .scrollbar-container {
          max-height: unset!important;
        }
        .CodeMirror {
          font-size: 14px;
          height: 100%!important;
        }
        .CodeMirror pre {
          line-height: 20.8px!important;
        }
        .CodeMirror-line {
          padding: 0 10px!important;
        }
        .CodeMirror-lines {
          padding: 10px 0!important;
        }
        .CodeMirror-linenumber {
          padding: 0 7px 0 5px!important;
        }
        .code-table {
          display: flex;
        }
        .code-table > div:first-of-type {
          flex: 1.5;
        }
        .code-table > div:last-of-type {
          flex: 1;
        }
        .code-table > div:last-child {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f4f6f9;
          font-family: -apple-system, BlinkMacSystemFont, avenir next, avenir, helvetica neue, helvetica, ubuntu, roboto, noto,
        segoe ui, arial, sans-serif;
          font-size: 4em;
          font-weight: 600;
          color: white;
        }
        .highlight {
          background: #ea567c;
          color: #CED4DE;
          margin: 0 3px;
          padding: 4px 6px;
          border-radius: 3px;
        }
        .grommetux-meter {
          height: 70px;
        }
        .grommetux-meter__graphic {
          fill: transparent;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-width: 15px;
          width: 70px;
          height: 70px;
        }
        .grommetux-meter__tracks {
          stroke: #272727;
        }
        .grommetux-meter__values {
          stroke: #CED4DE;
        }
        code {
          background: #7D899C;
          color: #EEF1F5;
          margin: 0 3px;
          padding: 4px 6px;
          border-radius: 3px;
          font-family: "Source Code Pro",monospace;
          font-size: 14px;
        }
      </style>
      `,
    },
  },
  themeConfig: {
    mode: 'dark',
    codemirrorTheme: 'dracula',
    colors: {
      primary: '#ea567c',
      //sidebarBg: 'white',
    },
    styles: {
      body: {
        fontFamily:
          '-apple-system, BlinkMacSystemFont, avenir next, avenir, helvetica neue, helvetica, ubuntu, roboto, noto, segoe ui, arial, sans-serif',
      },
      h1: {
        fontSize: '4em',
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
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve.alias,
          'react-spring': path.resolve('./src/targets/web')
        }
      }
    }
  },
}
