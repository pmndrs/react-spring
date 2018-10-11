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
          line-height: 1.8!important;
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
        .code-table > div {
          flex: 1;
        }
        .code-table > div:last-child {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fb467b;
          font-family: -apple-system, BlinkMacSystemFont, avenir next, avenir, helvetica neue, helvetica, ubuntu, roboto, noto,
        segoe ui, arial, sans-serif;
          font-size: 4em;
          font-weight: 600;
          color: white;
        }
        .highlight {
          background: #f4e6e9;
          color: #947679;
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
          stroke: rgba(255,255,255,0.1);
        }
        .grommetux-meter__values {
          stroke: white;
        }
        code {
          background: #f4f6f9;
          color: #7D899C;
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
    }
  },
}
