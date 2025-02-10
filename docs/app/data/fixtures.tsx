/* eslint-disable react/no-unescaped-entities */
import { DiscordLogo, GithubLogo, TwitterLogo } from 'phosphor-react'
import type { Quote } from '~/components/Cards/CardCarouselQuote'
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
      'Learn about how to use react-spring with step by step explanations',
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

const EVENTS_CELL: CellData[] = [
  {
    label: 'events',
    content: (
      <p>
        This is not a prop but rather a collection, see{' '}
        <a href="/docs/advanced/events">Events</a> for more information.
      </p>
    ),
  },
  'function',
  null,
]

const REF_CELL: CellData[] = [
  {
    label: 'ref',
    content: (
      <p>
        Used to access the imperative API. Animations never auto-start when{' '}
        <code>ref</code> is defined.
      </p>
    ),
  },
  'SpringRef',
  null,
]

const ToContent = (
  <p>
    The <code>to</code> prop, is very versatile, for more information checkout
    out <a href="/docs/advanced/async-animations">Async Animations</a>.
  </p>
)

export const DEFAULT_CONFIG_DATA: CellData[][] = [
  ['from', 'object', null],
  [
    {
      label: 'to',
      content: ToContent,
    },
    {
      label: 'object | object[] | function',
      content: (
        <code>{`(next: (props?: object) => Promise<void>, cancel: () => void) => Promise<void>`}</code>
      ),
    },
    null,
  ],
  [
    'loop',
    {
      label: 'boolean | object | function',
      content: <code>{`() => boolean`}</code>,
    },
    null,
  ],
  [
    {
      label: 'delay',
      content: <p>Delay in ms before the animation starts.</p>,
    },
    {
      label: 'number | function',
      content: <code>{`(key: string) => number`}</code>,
    },
    null,
  ],
  [
    {
      label: 'immediate',
      content: <p>Prevents the animation if true.</p>,
    },
    {
      label: 'boolean | function',
      content: <code>{`(key: string) => boolean`}</code>,
    },
    null,
  ],
  [
    {
      label: 'reset',
      content: (
        <p>Resets the spring so it plays from the start again when true.</p>
      ),
    },
    'boolean',
    null,
  ],
  [
    {
      label: 'reverse',
      content: (
        <p>
          Reverse the <code>to</code> and <code>from</code> prop so that{' '}
          <code>to</code> is the initial starting state.
        </p>
      ),
    },
    'boolean',
    null,
  ],
  [
    {
      label: 'pause',
      content: <p>Pause an animation at it's current point.</p>,
    },
    'boolean',
    null,
  ],
  [
    'cancel',
    {
      label: 'boolean | string | string[] | function',
      content: <code>{`(key: string) => boolean`}</code>,
    },
    null,
  ],
  REF_CELL,
  [
    {
      label: 'config',
      content: (
        <p>
          Spring config (mass / tension etc.), see{' '}
          <a href="/docs/advanced/config">Config</a> for more information.
        </p>
      ),
    },
    {
      label: 'object | function',
      content: <code>{`(key: string) => SpringConfig`}</code>,
    },
    {
      label: 'object',
      content: <code>{`{ mass: 1, tension: 170, friction: 26 }`}</code>,
    },
  ],
  EVENTS_CELL,
]

export const USE_SCROLL_CONFIG_DATA: CellData[][] = [
  ['container', 'React.MutableRefObject<HTMLElement>', null],
  ...DEFAULT_CONFIG_DATA.filter(
    row =>
      row[0] !== 'from' && typeof row[0] === 'object' && row[0]?.label !== 'to'
  ),
]

export const USE_RESIZE_CONFIG_DATA: CellData[][] = [
  ['container', 'React.MutableRefObject<HTMLElement | null | undefined>', null],
  ...DEFAULT_CONFIG_DATA.filter(
    row =>
      row[0] !== 'from' && typeof row[0] === 'object' && row[0]?.label !== 'to'
  ),
]

export const USESPRINGVALUE_CONFIG_DATA: CellData[][] = [
  [
    {
      label: 'to',
      content: ToContent,
    },
    {
      label: 'object | object[] | function',
      content: (
        <code>{`(next: (props?: object) => Promise<void>, cancel: () => void) => Promise<void>`}</code>
      ),
    },
    null,
  ],
  [
    'loop',
    {
      label: 'boolean | object | function',
      content: <code>{`() => boolean`}</code>,
    },
    null,
  ],
  [
    {
      label: 'delay',
      content: <p>Delay in ms before the animation starts.</p>,
    },
    {
      label: 'number | function',
      content: <code>{`(key: string) => number`}</code>,
    },
    null,
  ],
  [
    {
      label: 'immediate',
      content: (
        <p>
          Prevents the animation if true, applying the `to` styles immediately.
        </p>
      ),
    },
    {
      label: 'boolean | function',
      content: <code>{`(key: string) => boolean`}</code>,
    },
    null,
  ],
  [
    {
      label: 'reset',
      content: (
        <p>Resets the spring so it plays from the start again when true.</p>
      ),
    },
    'boolean',
    null,
  ],
  [
    {
      label: 'reverse',
      content: (
        <p>
          Reverse the <code>to</code> and <code>from</code> prop so that{' '}
          <code>to</code> is the initial starting state.
        </p>
      ),
    },
    'boolean',
    null,
  ],
  [
    {
      label: 'pause',
      content: <p>Pause an animation at it's current point.</p>,
    },
    'boolean',
    null,
  ],
  [
    'cancel',
    {
      label: 'boolean | string | string[] | function',
      content: <code>{`(key: string) => boolean`}</code>,
    },
    null,
  ],
  [
    {
      label: 'config',
      content: (
        <p>
          Spring config (mass / tension etc.), see{' '}
          <a href="/docs/advanced/config">Config</a> for more information.
        </p>
      ),
    },
    {
      label: 'object | function',
      content: <code>{`(key: string) => SpringConfig`}</code>,
    },
    {
      label: 'object',
      content: <code>{`{ mass: 1, tension: 170, friction: 26 }`}</code>,
    },
  ],
  EVENTS_CELL,
]

export const TRANSITION_CONFIG_DATA: CellData[][] = [
  [
    'from',
    {
      label: 'object | function',
      content: <code>{`(item: Item, index: number) => object`}</code>,
    },
    null,
  ],
  [
    'initial',
    {
      label: 'object | function',
      content: <code>{`(item: Item, index: number) => object`}</code>,
    },
    null,
  ],
  [
    {
      label: 'enter',
      content: (
        <p>
          The <code>enter</code> prop is used to pass styles to the animation
          when the transition is entering.
        </p>
      ),
    },
    {
      label: 'object | object[] | function',
      content: (
        <code>{`(item: Item, index: number) => object | object[] | (next: (props?: object) => Promise<void>, cancel: () => void) => Promise<void>`}</code>
      ),
    },
    null,
  ],
  [
    {
      label: 'update',
      content: (
        <p>
          The <code>update</code> prop is used to pass styles to the animation
          when the transition is updating.
        </p>
      ),
    },
    {
      label: 'object | object[] | function',
      content: (
        <code>{`(item: Item, index: number) => object | object[] | (next: (props?: object) => Promise<void>, cancel: () => void) => Promise<void>`}</code>
      ),
    },
    null,
  ],
  [
    {
      label: 'leave',
      content: (
        <p>
          The <code>leave</code> prop is used to pass styles to the animation
          when the transition is leaving.
        </p>
      ),
    },
    {
      label: 'object | object[] | function',
      content: (
        <code>{`(item: Item, index: number) => object | object[] | (next: (props?: object) => Promise<void>, cancel: () => void) => Promise<void>`}</code>
      ),
    },
    null,
  ],
  [
    {
      label: 'keys',
      content: (
        <p>
          Keys are automatically created so this prop is typically not required
        </p>
      ),
    },
    {
      label: 'Array<string | number> | function | null',
      content: <code>{`(item: Item) =>  string | number`}</code>,
    },
    null,
  ],
  [
    'sort',
    {
      label: 'function',
      content: <code>{`(a: Item, b: Item) => number`}</code>,
    },
    null,
  ],
  ['trail', 'number', '0'],
  ['exitBeforeEnter', 'boolean', 'false'],
  [
    {
      label: 'expires',
      content: (
        <>
          <p>
            When <code>true</code> or <code>{'<= 0'}</code>, each item is
            unmounted immediately after its `leave` animation is finished.
          </p>
          <br />
          <p>
            When <code>false</code>, items are never unmounted.
          </p>
          <br />
          <p>
            When <code>{'> 0'}</code>, this prop is used in a{' '}
            <code>setTimeout</code> call that forces a rerender if the component
            that called <code>useTransition</code> doesn't rerender on its own
            after an item's <code>leave</code> animation is finished.
          </p>
        </>
      ),
    },
    {
      label: 'boolean | number | function',
      content: <code>{`(item: Item) => boolean | number`}</code>,
    },
    'true',
  ],
  REF_CELL,
  [
    {
      label: 'config',
      content: (
        <p>
          Spring config (mass / tension etc.), see{' '}
          <a href="/docs/advanced/config">Config</a> for more information.
        </p>
      ),
    },
    {
      label: 'object | function',
      content: (
        <code>{`(item: Item, index: number, state: TransitionPhase) => SpringConfig`}</code>
      ),
    },
    {
      label: 'object',
      content: <code>{`{ mass: 1, tension: 170, friction: 26 }`}</code>,
    },
  ],
  EVENTS_CELL,
]

export const SPRINGVALUE_PROPERTIES_DATA: CellData[][] = [
  ['animation', 'Animation', 'Animation'],
  [
    {
      label: 'defaultProps',
      content: <p>Some props have customizable default values.</p>,
    },
    'SpringConfig',
    '{}',
  ],
  ['goal', 'any', null],
  [
    {
      label: 'hasAnimated',
      content: <p>When true, this value has been animated at least once.</p>,
    },
    'boolean',
    'false',
  ],
  [
    {
      label: 'idle',
      content: <p>Equals true when not advancing on each frame.</p>,
    },
    'boolean',
    null,
  ],
  [
    {
      label: 'isAnimating',
      content: <p>When true, this value has been animated at least once.</p>,
    },
    'boolean',
    'false',
  ],
  [
    {
      label: 'isDelayed',
      content: <p>When true the value has delay before it can animate.</p>,
    },
    'boolean',
    'false',
  ],
  [
    {
      label: 'isPaused',
      content: <p>When true, all current and future animations are paused.</p>,
    },
    'boolean',
    'false',
  ],
  [
    {
      label: 'key',
      content: (
        <p>
          The property name used when `to` or `from` is an object. Useful when
          debugging too.
        </p>
      ),
    },
    'string | undefined',
    'undefined',
  ],
  [
    {
      label: 'queue',
      content: <p>The queue of pending props</p>,
    },
    'SpringUpdate[]',
    '[]',
  ],
  ['velocity', 'number | number[]', null],
]

export const CONTROLLER_PROPERTIES_DATA: CellData[][] = [
  [
    {
      label: 'idle',
      content: (
        <p>
          The animated values. This is what you pass to your{' '}
          <code>animated</code> component.
        </p>
      ),
    },
    'SpringValues',
    '{}',
  ],
  ['item', 'any', null],
  [
    {
      label: 'queue',
      content: (
        <p>
          The queue of props passed to the <code>update</code> method.
        </p>
      ),
    },
    'ControllerQueue',
    '[]',
  ],
  [
    {
      label: 'ref',
      content: (
        <p>
          The injected ref. When defined, render-based updates are pushed onto
          the <code>queue</code> instead of being auto-started.
        </p>
      ),
    },
    'SpringRef',
    null,
  ],
  [
    {
      label: 'springs',
      content: (
        <p>
          The animated values. This is what you pass to your{' '}
          <code>animated</code> component.
        </p>
      ),
    },
    'SpringValues',
    '{}',
  ],
]

export const INTERPOLATONS_DATA: CellData[][] = [
  [
    'extrapolateLeft',
    {
      label: 'string',
      content: <code>{`"identity" | "clamp" | "extend"`}</code>,
    },
    'extend',
  ],
  [
    'extrapolateRight',
    {
      label: 'string',
      content: <code>{`"identity" | "clamp" | "extend"`}</code>,
    },
    'extend',
  ],
  [
    'extrapolate',
    {
      label: 'string',
      content: <code>{`"identity" | "clamp" | "extend"`}</code>,
    },
    'extend',
  ],
  [
    {
      label: 'range',
      content: <p>Array of input ranges</p>,
    },
    'number[]',
    '[0,1]',
  ],
  [
    {
      label: 'output',
      content: <p>Array of mapped output ranges</p>,
    },
    'number[]',
    null,
  ],
  [
    {
      label: 'map',
      content: <p>Value filter applied to input value</p>,
    },
    {
      label: 'function',
      content: <code>{`(value: number) => number`}</code>,
    },
    'null',
  ],
]

export const PARALLAX_CONFIG_DATA: CellData[][] = [
  [
    {
      label: 'pages',
      content: (
        <p>
          Determines the total space of the inner content where each page takes
          100% of the visible container.
        </p>
      ),
    },
    'number',
    null,
  ],
  [
    {
      label: 'config',
      content: (
        <p>
          Spring config (mass / tension etc.), see{' '}
          <a href="/docs/advanced/config">Config</a> for more information.
        </p>
      ),
    },
    {
      label: 'object | function',
      content: <code>{`(key: string) => SpringConfig`}</code>,
    },
    {
      label: 'object',
      content: <code>{`{ mass: 1, tension: 280, friction: 60 }`}</code>,
    },
  ],
  ['enabled', 'boolean', 'true'],
  ['horizontal', 'boolean', 'false'],
  ['innerStyle', 'CSSProperties', null],
]

export const PARALLAX_LAYER_CONFIG_DATA: CellData[][] = [
  ['horizontal', 'boolean', null],
  [
    {
      label: 'factor',
      content: <p>Size of a page, (1=100%, 1.5=1 and 1/2, ...)</p>,
    },
    'number',
    '1',
  ],
  [
    {
      label: 'offset',
      content: (
        <p>
          Determines where the layer will be at when scrolled to (0=start, 1=1st
          page, ...)
        </p>
      ),
    },
    'number',
    '0',
  ],
  [
    {
      label: 'speed',
      content: (
        <p>
          Shifts the layer in accordance to its offset, values can be positive
          or negative
        </p>
      ),
    },
    'number',
    '0',
  ],
  [
    {
      label: 'sticky',
      content: (
        <p>
          Layer will be sticky between these two offsets, all other props are
          ignored
        </p>
      ),
    },
    {
      label: 'StickyConfig',
      content: <code>{`{ start?: number; end?: number } | undefined`}</code>,
    },
    null,
  ],
]

export const USE_INVIEW_INTERSECTION_ARGS: CellData[][] = [
  ['amount', '"any" | "all" | number | number[]', 'any'],
  ['root', 'React.MutableRefObject', null],
  ['rootMargin', 'string', null],
  ['once', 'boolean', 'false'],
]
