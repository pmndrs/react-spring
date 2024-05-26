import clsx from 'clsx'
import { ReactNode } from 'react'
import { assignInlineVars } from '@vanilla-extract/dynamic'

import { container, heightVar, widthVar } from './AspectRatio.css'

interface AspectRatioProps {
  children: ReactNode
  className?: string
  width?: number
  height?: number
}

export const AspectRatio = ({
  children,
  width = 1,
  height = 1,
  className,
}: AspectRatioProps) => (
  <div
    className={clsx(container, className)}
    style={{
      ...assignInlineVars({
        [widthVar]: `${width}`,
        [heightVar]: `${height}`,
      }),
    }}
  >
    {children}
  </div>
)
