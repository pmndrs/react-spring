// @ts-nocheck
import { ButtonCopy } from '../Buttons/ButtonCopy'
import { LivePreview, LivePreviewProps } from './LivePreview'
import { pre } from './Pre.css'
import clsx from 'clsx'
import { preCopy } from './Code.css'

interface CodeProps
  extends Pick<
    LivePreviewProps,
    'code' | 'defaultOpen' | 'showCode' | 'template'
  > {
  id?: string
  isLive?: boolean
  showLineNumbers?: boolean
  ['data-showing-lines']?: boolean
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
  defaultOpen,
  template,
  showLineNumbers,
  id,
  'data-showing-lines': dataShowingLines,
  children,
  ...restProps
}: CodeProps) => {
  if (isLive) {
    return (
      <LivePreview
        code={code}
        showCode={showCode}
        className={className}
        defaultOpen={defaultOpen}
        preProps={{
          showLineNumbers,
          id,
          ['data-showing-lines']: dataShowingLines,
          children,
        }}
        template={template}
      />
    )
  } else {
    return (
      <pre className={clsx(pre, className)} {...restProps}>
        {copy ? <ButtonCopy className={preCopy}>{copy}</ButtonCopy> : null}
        {children}
      </pre>
    )
  }
}
