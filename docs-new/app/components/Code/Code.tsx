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
}

export const Code = ({ isLive, code, showCode, ...restProps }: CodeProps) => {
  if (isLive) {
    return (
      <LivePreview
        code={code ?? ''}
        showCode={showCode}
        preProps={{ ...restProps }}
      />
    )
  } else {
    return <Pre {...restProps} />
  }
}
