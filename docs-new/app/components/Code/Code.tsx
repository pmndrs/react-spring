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
}

export const Code = ({
  isLive,
  code,
  showCode,
  className,
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
    return <Pre className={className} {...restProps} />
  }
}
