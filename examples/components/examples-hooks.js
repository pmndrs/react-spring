export default [
  {
    name: 'goo',
    title: 'Goo blobs',
    link: 'https://codesandbox.io/embed/8zx4ppk01l',
    tags: ['useTrail'],
    code: {
      useSpring: `const [trail, set] = useTrail(3, () => ({ xy: [0, 0] }))
const tr = (x, y) => \`translate3d(\${x}px,\${y}px,0)\`
return (
  <div onMouseMove={({ clientX: x, clientY: y }) => set({ p1: [x, y] })}>
  {trail.map(({ xy }, index) => (
    <animated.div key={index} style={{ transform: xy.interpolate(tr) }} />
  ))}
  </div>
)`,
    },
  },
  {
    name: 'card',
    title: '3D card',
    link: 'https://codesandbox.io/embed/rj998k4vmm',
    tags: ['useSpring'],
    code: {
      useSpring: `const [props, set] = useSpring(() => ({ xys: [0, 0, 1] }))
const calc = (x, y) => [-(y - height / 2), (x - width / 2), 1.1]
const trans = (x, y, s) =>
  \`perspective(600px) rotateX(\${x}deg) rotateY(\${y}deg) scale(\${s})\`
return (
  <animated.div
    onMouseMove={({ clientX: x, clientY: y }) => set({ xys: calc(x, y) })}
    onMouseLeave={() => set({ xys: [0, 0, 1] })}
    style={{ transform: props.xys.interpolate(trans) }}
  />
)`,
    },
  },
  {
    name: 'flip-card',
    title: 'Flip card',
    link: 'https://codesandbox.io/embed/01yl7knw70',
    tags: ['useSpring'],
    code: {
      useSpring: `const { transform, opacity } = useSpring({
  opacity: flipped ? 1 : 0,
  transform: \`perspective(1400px) rotateX(\${flipped ? 180 : 0}deg)\`,
})
return (
  <a.div style={{ opacity: opacity.interpolate(o => 1 - o), transform }} />
  <a.div style={{ opacity, transform: transform.interpolate(t =>
    \`\${t} rotateX(180deg)\`) }} />
)`,
    },
  },
  {
    name: 'slider',
    title: 'Gesture slider',
    link: 'https://codesandbox.io/embed/zrj66y8714',
    tags: ['useSpring'],
    code: {
      useSpring: `const { x, bg, size } = useSpring({
  x: down ? xDelta : 0,
  size: down ? 1.1 : 1,
  immediate: name => down && name === 'x'
})
const transform =
  interpolate([x, size], (x, s) => \`translate3d(\${x}px,0,0) scale(\${s})\`)
return <animated.div style={{ transform }} children="Slide">`,
    },
  },
  {
    name: 'draggable-list',
    title: 'Draggable list',
    link: 'https://codesandbox.io/embed/r5qmj8m6lq',
    tags: ['useSprings'],
  },
  {
    name: 'mouse-parallax',
    title: 'Mouse parallax',
    link: 'https://codesandbox.io/embed/r5x34869vq',
    tags: ['useSpring'],
  },
  {
    name: 'scroll-parallax',
    title: 'Scroll parallax',
    link: 'https://codesandbox.io/embed/py912w5k6m',
    tags: ['useSpring'],
  },
  {
    name: 'trails',
    title: 'Trails',
    link: 'https://codesandbox.io/embed/zn2q57vn13',
    tags: ['useTrail'],
    code: {
      useTrail: `const trail = useTrail(items.length, {
  items,
  opacity: toggle ? 1 : 0,
  x: toggle ? 0 : 20,
  height: toggle ? 80 : 0,
  from: { opacity: 0, x: 20, height: 0 },
})
const transform = x.interpolate(x => \`translate3d(0,\${x}px,0)\`)
return trail.map(({ x, height, opacity }, index) => (
  <animated.div key={item} style={{ opacity, transform }}>
    <animated.div style={{ height }}>{items[index]}</animated.div>
  </animated.div>
))`,
    },
  },
  {
    name: 'simple-transition',
    title: 'Simple transition',
    link: 'https://codesandbox.io/embed/1y3yyqpq7q',
    tags: ['useTransition'],
    code: {
      useTransition: `const transitions = useTransition({
  items: pages[index],
  from: { opacity: 0, transform: 'translate3d(100%,0,0)' },
  enter: { opacity: 1, transform: 'translate3d(0%,0,0)' },
  leave: { opacity: 0, transform: 'translate3d(-50%,0,0)' },
})
return transitions.map(({ item: Page, props, key }) => (
  <Page key={key} style={props} />
))`,
    },
  },
  {
    name: 'image-fade',
    title: 'Image fade',
    link: 'https://codesandbox.io/embed/morr206pv8',
    tags: ['useTransition'],
    code: {
      useTransition: `const transitions = useTransition({
  items: slides[index],
  keys: item => item.id,
  from: { opacity: 0 },
  enter: { opacity: 1 },
  leave: { opacity: 0 },
})
return transitions.map(({ item, props, key }) => (
  <animated.div
    key={key}
    style={{ ...props, backgroundImage: \`url(\${item.url})\` }}
  />
))`,
    },
  },
  {
    name: 'multistage-transitions',
    title: 'Multistage transitions',
    link: 'https://codesandbox.io/embed/vqpqx5vrl0',
    tags: ['useTransition'],
  },
  {
    name: 'keyframes',
    title: 'Emulating css keyframes',
    link: 'https://codesandbox.io/embed/88lmnl6w88',
    tags: ['useSpring'],
  },
  {
    name: 'list-reordering',
    title: 'List-reordering',
    link: 'https://codesandbox.io/embed/1wqpz5mzqj',
    tags: ['useTransition'],
  },
  {
    name: 'chain-animation',
    title: 'Chain animation',
    link: 'https://codesandbox.io/embed/2v716k56pr',
    tags: ['useChain'],
  },
  {
    name: 'notification-hub',
    title: 'Notification hub',
    link: 'https://codesandbox.io/embed/7mqy09jyq',
    tags: ['useTransition'],
  },
  {
    name: 'keyframes-script',
    title: 'Spring scripting',
    link: 'https://codesandbox.io/embed/141nrz6v73',
    tags: ['useSpring'],
  },
  {
    name: 'keyframes-blackflag',
    title: 'Spring reset script',
    link: 'https://codesandbox.io/embed/8ypj5vq6m9',
    tags: ['useSpring'],
    code: {
      useKeyframes: `const interp = i => r =>
  \`translate3d(0, \${15 * Math.sin(r + (i * 2 * Math.PI) / 1.6)}px, 0)\`
const useScript = useKeyframes.spring(async next => {
  while (1)
    await next({
      r: 2 * Math.PI,
      from: { r: 0 },
      config: { duration: 3500 },
      reset: true,
    })
})

const props = useScript()
return items.map(i =>
  <animated.div style={{ transform: props.r.interpolate(interp(i)) }} />)`,
    },
  },
  {
    name: 'gestures-pull',
    title: 'Gestures (pull & release)',
    link: 'https://codesandbox.io/embed/r24mzvo3q',
    tags: ['useSpring'],
  },
  {
    name: 'gestures-pager',
    title: 'View pager',
    link: 'https://codesandbox.io/embed/n9vo1my91p',
    tags: ['useSprings'],
  },
  {
    name: 'card-flick',
    title: 'Card stack',
    link: 'https://codesandbox.io/embed/j0y0vpz59',
    tags: ['useSprings'],
  },
  {
    name: 'masonry-grid',
    title: 'Masonry grid',
    link: 'https://codesandbox.io/embed/26mjowzpr',
    tags: ['useTransition'],
  },
]
