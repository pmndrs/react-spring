export default [
  {
    name: 'hooks/goo',
    title: 'Goo blobs',
    link: 'https://codesandbox.io/embed/8zx4ppk01l',
    tags: ['useSpring'],
    code: {
      useSpring: `const [{ p1 }, set] = useSpring({ p1: [0, 0] })
const [{ p2 }] = useSpring({ p2: p1 })
const [{ p3 }] = useSpring({ p3: p2 })
const tr = (x, y) => \`translate3d(\${x}px,\${y}px,0)\`
return (
  <div onMouseMove={({ clientX: x, clientY: y }) => set({ p1: [x, y] })}>
    <animated.div style={{ transform: p3.interpolate(tr) }} />
    <animated.div style={{ transform: p2.interpolate(tr) }} />
    <animated.div style={{ transform: p1.interpolate(tr) }} />
  </div>
)`,
    },
  },
  {
    name: 'hooks/card',
    title: '3D card',
    link: 'https://codesandbox.io/embed/rj998k4vmm',
    tags: ['useSpring'],
    code: {
      useSpring: `const [props, set] = useSpring({ xys: [0, 0, 1] })
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
    name: 'hooks/slider',
    title: 'Gesture slider',
    link: 'https://codesandbox.io/embed/zrj66y8714',
    tags: ['useSpring'],
    code: {
      useSpring: `const [{ x, bg, size }] = useSpring({
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
    name: 'hooks/mouse-parallax',
    title: 'Mouse parallax',
    link: 'https://codesandbox.io/embed/r5x34869vq',
    tags: ['useSpring'],
  },
  {
    name: 'hooks/scroll-parallax',
    title: 'Scroll parallax',
    link: 'https://codesandbox.io/embed/py912w5k6m',
    tags: ['useSpring'],
  },
  {
    name: 'hooks/trails',
    title: 'Trails',
    link: 'https://codesandbox.io/embed/zn2q57vn13',
    tags: ['useTrail'],
    code: {
      useTrail: `const [trail] = useTrail({
  items,
  opacity: toggle ? 1 : 0,
  x: toggle ? 0 : 20,
  height: toggle ? 80 : 0,
  from: { opacity: 0, x: 20, height: 0 },
})
const transform = x.interpolate(x => \`translate3d(0,\${x}px,0)\`)
return trail.map(({ item, props: { x, height, opacity } }) => (
  <animated.div key={item} style={{ opacity, transform }}>
    <animated.div style={{ height }}>{item}</animated.div>
  </animated.div>
))`,
    },
  },
  {
    name: 'hooks/simple-transition',
    title: 'Simple transition',
    link: 'https://codesandbox.io/embed/1y3yyqpq7q',
    tags: ['useTransition'],
    code: {
      useTransition: `const transitions = useTransition({
  items: index,
  from: { opacity: 0, transform: 'translate3d(100%,0,0)' },
  enter: { opacity: 1, transform: 'translate3d(0%,0,0)' },
  leave: { opacity: 0, transform: 'translate3d(-50%,0,0)' },
})
return transitions.map(({ item, props, key }) => {
  const Page = pages[item]
  return <Page key={key} style={props} />
})`
    }
  },
  {
    name: 'hooks/multistage-transitions',
    title: 'Multistage transitions',
    link: 'https://codesandbox.io/embed/vqpqx5vrl0',
    tags: ['useTransition'],
  },
  {
    name: 'hooks/list-reordering',
    title: 'List-reordering',
    link: 'https://codesandbox.io/embed/1wqpz5mzqj',
    tags: ['useTransition'],
  },
  {
    name: 'hooks/notification-hub',
    title: 'Notification hub',
    link: 'https://codesandbox.io/embed/7mqy09jyq',
    tags: ['useTransition'],
  },
  {
    name: 'hooks/keyframes-script',
    title: 'Keyframes scripting',
    link: 'https://codesandbox.io/embed/141nrz6v73',
    tags: ['useKeyframes'],
  },
  {
    name: 'hooks/keyframes-blackflag',
    title: 'Keyframes reset script',
    link: 'https://codesandbox.io/embed/8ypj5vq6m9',
    tags: ['useKeyframes'],
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
  <animated.div style={{ transform: props.r.interpolate(interp(i)) }} />)`
    }
  },
]
