import { useEffect, useRef, useState } from 'react'
import { SandpackPreview, SandpackProvider } from '@codesandbox/sandpack-react'
import * as Accordion from '@radix-ui/react-accordion'
import { animated, useSpring } from '@react-spring/web'

import { Button } from '../Buttons/Button'
import { LIVE_PREVIEW_STYLES, LivePreviewStyles } from './LivePreviewStyles'
import { LIVE_PREVIEW_DEPS } from './LivePreviewDeps'

import { pre, showLineNumbers as showLineNumbersClass } from './Pre.css'
import {
  accordionContent,
  accordionHeader,
  accordionRoot,
  accordionTrigger,
  isDemo,
  largeSize,
  previewContainer,
} from './LivePreview.css'
import clsx from 'clsx'

export interface LivePreviewProps {
  code: string
  preProps: {
    id?: string
    showLineNumbers?: boolean
    ['data-showing-lines']?: boolean
  }
  showCode?: boolean
  defaultOpen?: boolean
  className?: string
  template?: keyof LivePreviewStyles
}

export const LivePreview = ({
  code,
  showCode = true,
  preProps: { showLineNumbers, ...restPreProps },
  className,
  defaultOpen = false,
  template = 'spring',
}: LivePreviewProps) => {
  const [value, setValue] = useState(defaultOpen ? 'code' : '')
  const preRef = useRef<HTMLPreElement>(null!)

  const codeTemplate = `
    import '/index.css'
    ${code}
  `

  const handleValueChange = (value: string) => setValue(value)

  const [styles, api] = useSpring(
    () => ({
      height: 0,
    }),
    []
  )

  const isMounted = useRef(false)

  useEffect(() => {
    api.start({
      height: value === '' ? 0 : preRef.current.getBoundingClientRect().height,
      immediate: !isMounted.current,
    })

    isMounted.current = true
  }, [value, api])

  return (
    <div
      className={clsx(
        previewContainer,
        className,
        template !== 'spring' && isDemo,
        (template === 'configPlayground' ||
          template === 'imperative' ||
          template === 'r3f') &&
          largeSize
      )}
    >
      <SandpackProvider
        template="react"
        files={{
          '/App.js': {
            code: codeTemplate,
          },
          '/index.css': {
            code: LIVE_PREVIEW_STYLES[template],
          },
        }}
        customSetup={{
          dependencies: {
            '@react-spring/web': '*',
            ...LIVE_PREVIEW_DEPS[template],
          },
        }}
        options={{
          classes: {
            'sp-wrapper': 'preview__wrapper',
            'sp-layout': 'preview__layout',
            'sp-stack': 'preview__stack',
            'sp-preview-container': 'preview__container',
            'sp-preview-iframe': 'preview__iframe',
            'sp-preview-actions': 'preview__actions',
            'sp-overlay': 'preview__overlay',
            'sp-button': 'preview__button',
          },
        }}
      >
        <SandpackPreview />
      </SandpackProvider>
      {showCode ? (
        <Accordion.Root
          type="single"
          collapsible
          value={value}
          className={accordionRoot}
          onValueChange={handleValueChange}
        >
          <Accordion.Item value="code">
            <Accordion.Header className={accordionHeader}>
              <Accordion.Trigger asChild>
                <Button className={accordionTrigger}>
                  {value === '' ? 'Show Code' : 'Hide Code'}
                </Button>
              </Accordion.Trigger>
            </Accordion.Header>
            <AccordionContent
              className={accordionContent}
              style={styles}
              forceMount
            >
              <pre
                ref={preRef}
                className={clsx(pre, showLineNumbers && showLineNumbersClass)}
                {...restPreProps}
              />
            </AccordionContent>
          </Accordion.Item>
        </Accordion.Root>
      ) : null}
    </div>
  )
}

const AccordionContent = animated(Accordion.Content)
