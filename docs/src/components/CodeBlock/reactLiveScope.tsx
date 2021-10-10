import {
  useRef,
  useEffect,
  useState,
  useLayoutEffect,
  useCallback,
  PureComponent,
} from 'react'
import {
  useSpring,
  animated,
  config,
  useChain,
  useSpringRef,
  useTransition,
  Spring,
  SpringRef,
  Transition,
} from '@react-spring/web'
import { Parallax, ParallaxLayer } from '@react-spring/parallax'
import { mdx } from '@mdx-js/react'
import useMeasure from 'react-use-measure'
// import VisibilitySensor from 'react-visibility-sensor'

// import { usePrev } from 'hooks/usePrev'

// type Effect = (() => () => void) | (() => void)

// const guard = (name: string, effect: Effect) => {
//   try {
//     return effect()
//   } catch (e) {
//     console.warn(name + ' threw an error: ' + e.stack)
//   }
// }

/**
 * It'd be nice to get this but currently,
 * it only supports useSpring....
 */
// const render = (useExample: any) => {
//   const Example = ({ visible }) => {
//     const wasVisible = usePrev(visible)
//     const style = guard('Example', () =>
//       // eslint-disable-next-line react-hooks/rules-of-hooks
//       useExample({
//         reset: !wasVisible && visible,
//         cancel: !visible,
//       })
//     )

//     return (
//       <animated.div
//         style={{
//           width: 80,
//           height: 80,
//           backgroundColor: 'purple',
//           borderRadius: 16,
//           ...style,
//         }}
//       />
//     )
//   }
//   return (
//     <VisibilitySensor>
//       {props => <Example visible={props.isVisible} />}
//     </VisibilitySensor>
//   )
// }

const springScope = {
  useSpring,
  useChain,
  useSpringRef,
  useTransition,
  config,
  animated,
  Spring,
  SpringRef,
  Transition,
  Parallax,
  ParallaxLayer,
}

const reactScope = {
  useRef,
  useEffect,
  useState,
  useLayoutEffect,
  useCallback,
  PureComponent,
}

const utilityScope = {
  mdx,
  useMeasure,
}

const dataScope = {
  NUM_TRANS: [
    {
      fig: 1,
      op: { range: [0.75, 1.0], output: [0, 1] },
      trans: { range: [0.75, 1.0], output: [-40, 0], extrapolate: 'clamp' },
    },
    {
      fig: 2,
      op: { range: [0.25, 0.5], output: [0, 1] },
      trans: { range: [0.25, 0.5], output: [-40, 0], extrapolate: 'clamp' },
    },
    {
      fig: 3,
      op: { range: [0.0, 0.25], output: [0, 1] },
      trans: { range: [0.0, 0.25], output: [-40, 0], extrapolate: 'clamp' },
    },
    {
      fig: 4,
      op: { range: [0.5, 0.75], output: [0, 1] },
      trans: { range: [0.5, 0.75], output: [-40, 0], extrapolate: 'clamp' },
    },
  ],
  POINTS:
    '22.5 35.25 8.68704657 42.5118994 11.3250859 27.1309497 0.150171867 16.2381006 15.5935233 13.9940503 22.5 0 29.4064767 13.9940503 44.8498281 16.2381006 33.6749141 27.1309497 36.3129534 42.5118994',
}

export const scope = {
  ...springScope,
  ...reactScope,
  ...utilityScope,
  ...dataScope,
}
