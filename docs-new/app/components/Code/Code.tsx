import { LivePreview } from './LivePreview'
import { Pre } from './Pre'

interface CodeProps {
  id?: string
  code: string
  isLive: boolean
  showLineNumbers: boolean
  ['data-showing-lines']: boolean
  children: any
}

export const Code = ({ isLive, code, ...restProps }: CodeProps) => {
  if (isLive) {
    return <LivePreview code={code} preProps={{ ...restProps }} />
  } else {
    return <Pre {...restProps} />
  }
}
