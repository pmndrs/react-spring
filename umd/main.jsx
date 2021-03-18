const { a, useSpring } = ReactSpring

const App = () => {
  const s = useSpring({
    from: {
      width: 100,
      height: 100,
      backgroundColor: 'red',
      rotateZ: 0,
    },
    to: {
      width: document.body.clientWidth,
      height: document.body.clientHeight,
      backgroundColor: 'blue',
      rotateZ: 180,
    },
    config: {
      frequency: 0.8,
    },
    loop: {
      reverse: true,
      delay: 300,
    },
  })
  return <a.div style={s} />
}

ReactDOM.render(<App />, document.getElementById('app'))
