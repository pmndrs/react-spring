// Inpired by: https://codepen.io/popmotion/pen/xWrbNm?editors=0010

import React from 'react'
import { withGesture } from 'react-with-gesture'
import { Spring } from 'react-spring'
import clamp from 'clamp'
import './styles.css'

@withGesture // https://github.com/drcmda/react-with-gesture
export default class extends React.Component {
    render() {
        const { xDelta, down, children } = this.props
        const to = { scale: clamp(Math.abs(down ? xDelta : 0) / 150, 0.5, 1.2), x: down ? xDelta : 0 }
        return (
            <div className="gestures-main">
                <Spring to={to} immediate={down && ['x']}>
                    {({ x, scale }) => (
                        <div className="item" style={{ backgroundColor: xDelta < 0 ? '#FF1C68' : '#14D790' }}>
                            <div className="bubble" style={{ transform: `scale(${scale})`, justifySelf: xDelta < 0 ? 'end' : 'start' }} />
                            <div className="fg" style={{ transform: `translate3d(${x}px,0,0)` }}>
                                Slide me ...
                            </div>
                        </div>
                    )}
                </Spring>
            </div>
        )
    }
}
