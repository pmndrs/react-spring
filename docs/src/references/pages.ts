export type Page = {
  title: string
  url?: string
  routes?: Page[]
}

export const PAGES: Page[] = [
  {
    title: 'Introduction',
    url: '/#introduction',
  },
  {
    title: 'Basics',
    url: '/basics#basics',
  },
  {
    title: 'API',
    routes: [
      {
        title: 'Common',
        routes: [
          {
            title: 'Props',
            url: '/common/props#props',
          },
          {
            title: 'Configs',
            url: '/common/configs#configs',
          },
          {
            title: 'Imperatives & Refs',
            url: '/common/imperatives-and-refs#imperatives-and-refs',
          },
          {
            title: 'Interpolations',
            url: '/common/interpolation#interpolation',
          },
        ],
      },
      {
        title: 'Hooks',
        routes: [
          {
            title: 'useChain',
            url: '/hooks/use-chain#use-chain',
          },
          {
            title: 'useSpring',
            url: '/hooks/use-spring#use-spring',
          },
          {
            title: 'useSprings',
            url: '/hooks/use-springs#use-springs',
          },
          {
            title: 'useTrail',
            url: '/hooks/use-trail#use-trail',
          },
          {
            title: 'useTransition',
            url: '/hooks/use-transition#use-transition',
          },
        ],
      },
      {
        title: 'Render Props',
        routes: [
          {
            title: 'Parallax',
            url: '/components/parallax#parallax',
          },
          {
            title: 'Spring',
            url: '/components/spring#spring',
          },
          {
            title: 'Spring Context',
            url: '/components/spring-context#spring-context',
          },
          {
            title: 'Trail',
            url: '/components/trail#trail',
          },
          {
            title: 'Transition',
            url: '/components/transition#transition',
          },
        ],
      },
      {
        title: 'Additional Classes',
        routes: [
          { title: 'Controller', url: '/classes/controller#controller' },
          { title: 'Spring Value', url: '/classes/spring-value#spring-value' },
        ],
      },
    ],
  },
  {
    title: 'Guides',
    routes: [
      {
        title: 'Accessibility',
        url: '/guides/accessibility#accessibility',
      },
      {
        title: 'React Three Fiber',
        url: '/guides/r3f#react-three-fiber',
      },
      {
        title: 'Testing',
        url: '/guides/testing#testing',
      },
    ],
  },
  {
    title: 'Changelog',
    url: 'https://github.com/pmndrs/react-spring/releases',
  },
]
