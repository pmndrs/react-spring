export type Page = {
  title: string
  url?: string
  routes?: Page[]
}

export const PAGES: Page[] = [
  {
    title: 'Introduction',
    url: '/',
  },
  {
    title: 'Basics',
    url: '/basics',
  },
  {
    title: 'API',
    routes: [
      {
        title: 'Common',
        routes: [
          {
            title: 'Props',
            url: '/common/props',
          },
          {
            title: 'Configs',
            url: '/common/configs',
          },
          {
            title: 'Imperatives & Refs',
            url: '/common/imperatives-and-refs',
          },
          {
            title: 'Interpolations',
            url: '/common/interpolation',
          },
        ],
      },
      {
        title: 'Hooks',
        routes: [
          {
            title: 'useChain',
            url: '/hooks/use-chain',
          },
          {
            title: 'useSpring',
            url: '/hooks/use-spring',
          },
          {
            title: 'useSprings',
            url: '/hooks/use-springs',
          },
          {
            title: 'useTrail',
            url: '/hooks/use-trail',
          },
          {
            title: 'useTransition',
            url: '/hooks/use-transition',
          },
        ],
      },
      {
        title: 'Render Props',
        routes: [
          {
            title: 'Parallax',
            url: '/components/parallax',
          },
          {
            title: 'Spring',
            url: '/components/spring',
          },
          {
            title: 'Spring Context',
            url: '/components/spring-context',
          },
          {
            title: 'Trail',
            url: '/components/trail',
          },
          {
            title: 'Transition',
            url: '/components/transition',
          },
        ],
      },
      {
        title: 'Additional Classes',
        routes: [
          { title: 'Controller', url: '/classes/controller' },
          { title: 'Spring Value', url: '/classes/spring-value' },
        ],
      },
    ],
  },
  {
    title: 'Guides',
    routes: [
      {
        title: 'Accessibility',
        url: '/guides/accessibility',
      },
      {
        title: 'Testing',
        url: '/guides/testing',
      },
    ],
  },
  {
    title: 'Changelog',
    url: '/changelog',
  },
]
