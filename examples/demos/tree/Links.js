import React, { Fragment } from 'react'
import Link from './Link'

function Links({ links, linkType, layout, orientation, stepPercent }) {
  return (
    <Fragment>
      {links.map((link, i) => (
        <Link
          data={link}
          linkType={linkType}
          layout={layout}
          orientation={orientation}
          stepPercent={stepPercent}
          stroke="#374469"
          strokeWidth="1"
          fill="none"
          key={i}
        />
      ))}
    </Fragment>
  )
}

export default Links
