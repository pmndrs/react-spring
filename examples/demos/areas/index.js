import React from 'react'
import { curveBasis } from '@vx/curve'
import { AreaClosed, LinePath, Line } from '@vx/shape'
import { scaleTime, scaleLinear } from '@vx/scale'
import { ParentSize } from '@vx/responsive'
import { GradientPurpleTeal } from '@vx/gradient'
import { genDateValue } from '@vx/mock-data'
import { extent, max } from 'd3-array'
import { Spring } from 'react-spring'

const data = genDateValue(20)
const x = d => d.date
const y = d => d.value

const Graph = ({ interpolate, data, xScale, yScale }) => (
    <AreaClosed
        data={data.map((d, i) => ({ ...d, value: interpolate[i] }))}
        xScale={xScale}
        yScale={yScale}
        x={x}
        y={y}
        strokeWidth={2}
        stroke={'url(#gradient)'}
        fill={'url(#gradient)'}
        curve={curveBasis}
    />
)

export default class extends React.Component {
    state = { toggle: true }
    toggle = () => this.setState(state => ({ toggle: !state.toggle }))
    render() {
        return (
            <div style={{ gridRow: 'span 2' }}>
            <ParentSize>
                {({ width, height }) => {
                    const xScale = scaleTime({ range: [0, width], domain: extent(data, x) })
                    const yMax = max(data, y)
                    const yScale = scaleLinear({ range: [height / 2, 0], domain: [0, yMax], nice: true })
                    const interpolate = data.map(d => Math.random() * yMax)
                    const extra = { data, xScale, yScale }
                    return (
                        <div style={{ width: '100%', height: '100%', cursor: 'pointer', background: '#FF1C68' }} onClick={this.toggle}>
                            <svg style={{ position: 'absolute', bottom: 0 }} width={width} height={height / 2}>
                                <GradientPurpleTeal id="gradient" />
                                <g>
                                    <Spring to={{ interpolate }} {...extra} children={Graph} />
                                </g>
                            </svg>
                        </div>
                    )
                }}
            </ParentSize>
            </div>
        )
    }
}
