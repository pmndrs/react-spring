import React from 'react'
import ReactDOM from 'react-dom'
import Spring from './demos/spring/'
import NativeSpring from './demos/nativespring/'
import Transitions from './demos/transitions/'
import Reveals from './demos/reveals/'
import Trails from './demos/trails/'
import Parallax from './demos/parallax/'
import Scroll from './demos/scroll/'
import Gestures from './demos/gestures/'
import Sunburst from './demos/sunburst/'
import Tree from './demos/tree/'
import Areas from './demos/areas/'
import './index.css'

const App = () => (
    <div className="app-container">
        <Scroll />
        <Parallax />
        <Reveals />
        <NativeSpring />
        <Transitions />
        <Trails />
        <Areas />
        <Sunburst />
        <Tree />
        <Gestures style={{ gridColumn: 'span 2' }}/>
    </div>
)

ReactDOM.render(<App />, document.getElementById('root'))
