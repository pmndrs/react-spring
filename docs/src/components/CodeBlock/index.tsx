import React from 'react'
import Highlight, { defaultProps, Language } from 'prism-react-renderer'
import theme from 'prism-react-renderer/themes/palenight'
import { LiveProvider, LivePreview, LiveError, LiveEditor } from 'react-live'
import LazyLoad from 'react-lazyload'

import { SpringIcon } from '../Media/MediaImage'

import { scope } from './reactLiveScope'

interface CodeBlockProps {
  children: string
  className?: string
  live?: boolean | string
  render?: boolean | string
  url: string
  code?: boolean | string
  center?: boolean | string
  edit?: boolean | string
}

export const CodeBlock = ({
  children,
  className = '',
  live,
  render,
  url,
  code = true,
  center = true,
  edit = false,
}: CodeBlockProps) => {
  const language = className.replace(/language-/, '')

  if (live && url) {
    return (
      <LazyLoad height={600} once>
        <iframe
          src={url}
          style={{
            width: '100%',
            height: 600,
          }}
          allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
          sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
        />
      </LazyLoad>
    )
  }

  if (render) {
    return (
      <div style={{ position: 'relative' }}>
        <div className="code-table">
          {!edit && code !== 'false' && (
            <Highlight
              {...defaultProps}
              theme={theme}
              code={children.trim()}
              language={language as Language}>
              {({ className, style, tokens, getLineProps, getTokenProps }) => (
                <pre
                  className={className}
                  style={{ ...style, padding: '20px' }}>
                  {tokens.map((line, i) => (
                    <div key={i} {...getLineProps({ line, key: i })}>
                      {line.map((token, key) => (
                        <span key={key} {...getTokenProps({ token, key })} />
                      ))}
                    </div>
                  ))}
                </pre>
              )}
            </Highlight>
          )}
          <LiveProvider
            scope={scope}
            code={children.trim()}
            transformCode={code => '/** @jsx mdx */' + code}
            theme={theme}>
            {edit && <LiveEditor className="live-editor" />}
            {process.env.NODE_ENV !== 'production' && <LiveError />}
            <LazyLoad height={'100%'}>
              <LivePreview
                style={{
                  justifyContent: center !== 'false' ? 'center' : 'flex-start',
                  color: 'rgb(45, 55, 71)',
                  padding: '0 16px',
                }}
              />
            </LazyLoad>
          </LiveProvider>
        </div>
        {edit && <SpringIcon />}
      </div>
    )
  }

  return (
    <Highlight
      {...defaultProps}
      theme={theme}
      code={children.trim()}
      language={language as Language}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre className={className} style={{ ...style, padding: '20px' }}>
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line, key: i })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token, key })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  )
}
