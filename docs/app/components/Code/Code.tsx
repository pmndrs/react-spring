import { styled } from '~/styles/stitches.config'

import { ButtonCopy } from '../Buttons/ButtonCopy'
import { LivePreview } from './LivePreview'

import { Pre } from './Pre'

interface CodeProps {
  id?: string
  code?: string
  isLive?: boolean
  showLineNumbers?: boolean
  ['data-showing-lines']?: boolean
  showCode?: boolean
  children?: any
  className?: string
  copy?: string
}

export const Code = ({
  isLive,
  code,
  showCode,
  className,
  copy,
  ...restProps
}: CodeProps) => {
  if (isLive) {
    return (
      <LivePreview
        code={code ?? ''}
        showCode={showCode}
        className={className}
        preProps={{ ...restProps }}
      />
    )
  } else {
    return (
      <Pre className={className} {...restProps}>
        {copy ? <PreCopy>{copy}</PreCopy> : null}
        {restProps.children}
      </Pre>
    )
  }
}

const PreCopy = styled(ButtonCopy, {
  position: 'absolute',
  top: 24,
  right: 24,
})
