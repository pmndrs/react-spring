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
    //mode: 'dark',
    codemirrorTheme: 'dracula',
    colors: {
      primary: '#ea567c',
      sidebarBg: 'white',
      //sidebarText: 'white'
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
  /*modifyBabelRc: config => {
    console.log(config)
    config.plugins.push('react-docgen')
    return config
  },*/
  modifyBundlerConfig: (config, dev, args) => {
    //console.log(config, dev, args)
    return { ...config, mode: 'development' }
  },
}
