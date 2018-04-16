import React from 'react'
import { ParentSize } from '@vx/responsive'
import Tree from './Tree'
import data from './data'

const TreeExample = () => (
  <ParentSize>
    {size =>
      size.ref && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            background: '#272b4d',
          }}>
          <Tree
            data={data}
            width={size.width * 0.9}
            height={size.height * 0.9}
          />
        </div>
      )
    }
  </ParentSize>
)

export default TreeExample
