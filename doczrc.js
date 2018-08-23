export default {
  title: 'react-spring',
  src: './src/',
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
    //mode: 'dark',
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
        fontSize: 100,
        fontWeight: 800,
      },
    },
  },
}
