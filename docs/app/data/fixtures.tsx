import { DiscordLogo, GithubLogo, TwitterLogo } from 'phosphor-react'
import type { Quote } from '~/components/Carousels/CarouselQuotes'
import { Tile } from '~/components/Grids/NavigationGrid'
import { CellData } from '~/components/Tables/TablesConfig'

export const QUOTES: Quote[] = [
  {
    text: `Holy smokes. I don't think animation can get any easier in React now with React Spring. Wrapping Reach UI (https://reach.tech/ui) in your own brand and feel is going to be so easy.`,
    name: 'Ryan Florence',
    img: 'ryan_florence.jpeg',
    handle: '@ryanflorence',
    tweetUrl: 'https://twitter.com/ryanflorence/status/1033962041298509824',
    job: 'Remix Co-founder',
  },
  {
    text: `Big fan of React Spring!`,
    name: 'Ives van Hoorne',
    img: 'ives_van_hoorne.jpeg',
    handle: '@CompuIves',
    tweetUrl: 'https://twitter.com/CompuIves/status/1033964001246543872',
    job: 'Creator of Codesandbox',
  },
  {
    text: `react-spring is insane. I haven't done a lot of animations but it's the first React library I come across that does it the correct way: not using setState to change styles but bypass React.`,
    name: 'Alexander Prinzhorn',
    img: 'alexander_prinzhorn.jpeg',
    handle: '@Prinzhorn',
    tweetUrl: 'https://twitter.com/Prinzhorn/status/1007560091430801409',
    job: 'Software Engineer',
  },
  {
    text: `It's fantastic :) In my React Rally talk, I explicitly recommend it over React Motion, and all the demos use it (shout-out to @0xca0a). Will share a link to it once the talk vid is up.`,
    name: 'Josh W. Comeau',
    img: 'josh_w._comeau.jpeg',
    handle: '@JoshWComeau',
    tweetUrl: 'https://twitter.com/JoshWComeau/status/1030826919124590597',
    job: 'Creator of CSS for JavaScript Developers',
  },
  {
    text: `If you like react-motion but feel like your transitions aren’t smooth, it’s because it’s exclusively using React rendering. If you like Popmotion but feel like you are limited by what you can do, it’s because it entirely skips React rendering. react-spring does both, try it 👌`,
    name: 'Pierre Bertet',
    img: 'pierre_bertet.jpeg',
    handle: '@bpierre',
    tweetUrl: 'https://twitter.com/bpierre/status/1032284123161931778',
    job: 'Software Engineer',
  },
  {
    text: `react-spring by @0xca0a is a lovely animation library for react`,
    name: '//',
    img: 'no_name.jpeg',
    handle: '@hshoff',
    tweetUrl: 'https://twitter.com/hshoff/status/983054609353707520',
    job: 'Engineer at Airbnb',
  },
  {
    text: `The animation lib React Spring is so awesome! Great API (first-class support for hooks), performant (doesn't trigger a re-render) and cross-platform (web / react-native / universal). Adding animations makes the app much more fun to use.`,
    name: 'bruno lemos',
    img: 'bruno_lemos.jpeg',
    handle: '@brunolemos',
    tweetUrl: 'https://twitter.com/brunolemos/status/1087456685080358918',
    job: 'Software Engineer',
  },
  {
    text: `this would’ve been impossible without the hard work from everyone at @pmndrs, zustand, r3f, react-spring, and obviously @clementroche_‘s incredible talent. but it was no easy task to learn all the tricks we now know.. and thinking about all the stuff we still don’t `,
    name: 'arzafran',
    img: 'arzafran.png',
    handle: '@arzafran',
    tweetUrl: 'https://twitter.com/arzafran/status/1476169639973560334',
    job: 'Partner at Studio Freight',
  },
  {
    text: `So, it turns out you can mix HTML and WebGL. And with react-spring you can animate both.`,
    name: 'Varun Vachhar',
    img: 'varun_vachhar.jpeg',
    handle: '@winkerVSbecks',
    tweetUrl: 'https://twitter.com/winkerVSbecks/status/1419032183952576515',
    job: 'Software Engineer',
  },
  {
    text: `The game being game, I have a lot of animations. I started using what is proposed by tailwind but it is not good enough for 2020. I ended moving to react spring. The learning curve is steeper than what I had expect. But it's a delightful experience afterwards.`,
    name: 'Alex Stanislawski',
    img: 'alex_stanislawski.jpeg',
    handle: '@bobylito',
    tweetUrl: 'https://twitter.com/bobylito/status/1337144280171819018',
    job: 'Software Engineer',
  },
]

export const NAV_TILES: Tile[] = [
  {
    href: '/docs/getting-started',
    label: 'Getting Started',
    description:
      'Learn about how use react-spring with step by step explanations',
  },
  {
    href: '/docs/guides',
    label: 'Guides & Tutorials',
    description:
      'Read up on step-by-step tutorials for common use cases exploring our different hooks',
    comingSoon: true,
  },
  {
    href: '/examples',
    label: 'Examples',
    description:
      'Be inspired by exploring all our examples, why not contribute your own?',
    comingSoon: true,
  },
]

export const COMMUNITY_TILES: Tile[] = [
  {
    label: 'Discord',
    description: 'Ask questions, share tips & tricks',
    href: 'https://discord.gg/AXfNsGx64f',
    isExternal: true,
    Icon: DiscordLogo,
  },
  {
    label: 'Github',
    description: 'Report issues, submit ideas and contribute',
    isExternal: true,
    href: 'https://www.github.com/pmndrs/react-spring',
    Icon: GithubLogo,
  },
  {
    label: 'Twitter',
    description: 'Keep up to date with all things Poimandres',
    isExternal: true,
    href: 'https://www.twitter.com/pmndrs',
    Icon: TwitterLogo,
  },
]

export const TOOL_TILES = [
  {
    label: 'react-three-fiber',
    description: 'A React renderer for Three.js',
    href: 'https://www.github.com/pmndrs/react-three-fiber',
    isExternal: true,
    Icon: '⚡️',
  },
  {
    label: '@use-gesture',
    description:
      'Bread n butter utility for component-tied mouse/touch gestures in React and Vanilla Javascript.',
    href: 'https://github.com/pmndrs/use-gesture',
    isExternal: true,
    Icon: '🤙',
  },
  {
    label: 'leva',
    description: 'React-first components GUI',
    href: 'https://www.github.com/pmndrs/leva',
    isExternal: true,
    Icon: '🌋',
  },
  {
    label: 'zustand',
    description: 'Bear necessities for state management in React',
    href: 'https://www.github.com/pmndrs/zustand',
    isExternal: true,
    Icon: '🐻',
  },
]

export const configData: CellData[][] = [
  ['mass', 'number', '1'],
  ['tension', 'number', '170'],
  ['friction', 'number', '26'],
  [
    {
      label: 'bounce',
      content: (
        <p>
          When above zero, the spring will bounce instead of overshooting when
          exceeding its goal value.
        </p>
      ),
    },
    'number',
    null,
  ],
  [
    {
      label: 'clamp',
      content: (
        <p>When true, stops the spring once it overshoots its boundaries.</p>
      ),
    },
    'boolean',
    'false',
  ],
  [
    {
      label: 'precision',
      content: (
        <p>
          How close to the goal the animated value gets before we consider it to
          be "done", see <a href="#precision">precision</a> pifalls for more
          information.
        </p>
      ),
    },
    'number',
    '0.01',
  ],
  [
    {
      label: 'round',
      content: (
        <p>
          While animating, round to the nearest multiple of this number. The
          from and to values are never rounded, as well as any value passed to
          the set method of an animated value.
        </p>
      ),
    },
    'boolean',
    null,
  ],
  [
    {
      label: 'frequency',
      content: (
        <p>
          The natural frequency (in seconds), which dictates the number of
          bounces per second when no <code>damping</code> exists. When defined,
          <code>tension</code> is derived from this, and <code>friction</code>{' '}
          is derived from <code>tension</code> and <code>damping</code>.
        </p>
      ),
    },
    'number',
    null,
  ],
  [
    {
      label: 'damping',
      content: (
        <p>
          The damping ratio, which dictates how the spring slows down. Only
          works when frequency is defined.
        </p>
      ),
    },
    'number',
    '1',
  ],
  ['velocity', 'number', '0'],
  [
    {
      label: 'restVelocity',
      content: (
        <p>
          The smallest velocity before the animation is considered to be "not
          moving". When undefined, precision is used instead.
        </p>
      ),
    },
    'number',
    null,
  ],
  [
    'decay',
    {
      label: 'number | boolean',
      content: (
        <p>
          If <code>true</code>, default value is <code>0.998</code>.
        </p>
      ),
    },
    'false',
  ],
  [
    {
      label: 'duration',
      content: (
        <p>
          Switches to duration based animation. Value should be indicated in
          milliseconds.
        </p>
      ),
    },
    'number',
    null,
  ],
  [
    'easing',
    {
      label: 'function',
      content: <code>{`(t: number) => number`}</code>,
    },
    't => t',
  ],
  [
    {
      label: 'progress',
      content: (
        <p>
          Decides how far into the easing function to start from. The duration
          itself is unaffected.
        </p>
      ),
    },
    'number',
    '0',
  ],
]

export const easingData: CellData[][] = [
  ['easeInBack', 'easeOutBack', 'easeInOutBack'],
  ['easeInBounce', 'easeOutBounce', 'easeOutBounce'],
  ['easeInCirc', 'easeOutCirc', 'easeOutCirc'],
  ['easeInCubic', 'easeOutCubic', 'easeOutCubic'],
  ['easeInElastic', 'easeOutElastic', 'easeOutElastic'],
  ['easeInExpo', 'easeOutExpo', 'easeOutExpo'],
  ['easeInQuad', 'easeOutQuad', 'easeOutQuad'],
  ['easeInQuart', 'easeOutQuart', 'easeOutQuart'],
  ['easeInQuint', 'easeOutQuint', 'easeOutQuint'],
  ['easeInSine', 'easeOutSine', 'easeOutSine'],
]
