import React from 'react'
import { hierarchy } from 'd3-hierarchy'
import { Group } from '@vx/group'
import { ParentSize } from '@vx/responsive'
import { arc as d3arc } from 'd3-shape'
import { scaleLinear, scaleSqrt, scaleOrdinal } from 'd3-scale'
import { schemeCategory10 as scheme } from 'd3-scale-chromatic'
import { interpolate as d3interpolate } from 'd3-interpolate'
import { Spring, animated } from 'react-spring'
import Partition from './Partition'
import data from './data'
import './styles.css'

var color = scaleOrdinal().range(['#FE938C', '#E6B89C', '#EAD2AC', '#9CAFB7', '#4281A4'])

class Example extends React.Component {
    constructor(props) {
        super()
        this.state = { xDomain: [0, 1], xRange: [0, 2 * Math.PI], yDomain: [0, 1], yRange: [0, props.width / 2] }
        const { xDomain, xRange, yDomain, yRange } = this.state
        this.xScale.domain(xDomain).range(xRange)
        this.yScale.domain(yDomain).range(yRange)
    }

    componentWillReceiveProps(props) {
        this.setState(state => ({ yRange: [state.yRange[0], props.width / 2] }))
    }

    xScale = scaleLinear()
    yScale = scaleSqrt()
    arc = d3arc()
        .startAngle(d => Math.max(0, Math.min(2 * Math.PI, this.xScale(d.x0))))
        .endAngle(d => Math.max(0, Math.min(2 * Math.PI, this.xScale(d.x1))))
        .innerRadius(d => Math.max(0, this.yScale(d.y0)))
        .outerRadius(d => Math.max(0, this.yScale(d.y1)))

    handleClick = d => this.setState({ xDomain: [d.x0, d.x1], yDomain: [d.y0, 1], yRange: [d.y0 ? 20 : 0, this.props.width / 2] })
    handleUpdate = (t, xd, yd, yr) => {
        this.xScale.domain(xd(t))
        this.yScale.domain(yd(t)).range(yr(t))
    }

    render() {
        const { root, width, height, margin = { top: 0, left: 0, right: 0, bottom: 0 } } = this.props
        const { xDomain, yDomain, yRange } = this.state
        if (width < 10) return null
        const xd = d3interpolate(this.xScale.domain(), xDomain)
        const yd = d3interpolate(this.yScale.domain(), yDomain)
        const yr = d3interpolate(this.yScale.range(), yRange)
        return (
            <svg width={width} height={height}>
                <Partition top={margin.top} left={margin.left} root={root}>
                    <Spring native reset from={{ t: 0 }} to={{ t: 1 }} onFrame={({ t }) => this.handleUpdate(t, xd, yd, yr)}>
                        {({ t }) => (
                            <Group top={height / 2} left={width / 2}>
                                {root
                                    .descendants()
                                    .map((node, i) => (
                                        <animated.path
                                            className="path"
                                            d={t.interpolate(() => this.arc(node))}
                                            stroke="#14D790"
                                            strokeWidth="6"
                                            fill={color((node.children ? node.data : node.parent.data).name)}
                                            fillRule="evenodd"
                                            onClick={() => this.handleClick(node)}
                                            key={`node-${i}`}
                                        />
                                    ))}
                            </Group>
                        )}
                    </Spring>
                </Partition>
            </svg>
        )
    }
}

const root = hierarchy(data).sum(d => d.size)
const App = () => (
    <ParentSize>
        {size =>
            size.ref && (
                <div className="sunburst-main">
                    <Example root={root} width={size.width * 0.7} height={size.width * 0.7} />
                </div>
            )
        }
    </ParentSize>
)

export default App
