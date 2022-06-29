import { useEffect, useRef, useState } from 'react'
import { SandpackPreview, SandpackProvider } from '@codesandbox/sandpack-react'
import * as Accordion from '@radix-ui/react-accordion'
import { animated, useSpring } from '@react-spring/web'

import { dark, styled } from '~/styles/stitches.config'

import { Pre } from './Pre'
import { Button } from '../Buttons/Button'

interface LivePreviewProps {
  code: string
  preProps: {
    id?: string
    showLineNumbers?: boolean
    ['data-showing-lines']?: boolean
  }
  showCode?: boolean
  defaultOpen?: boolean
  className?: string
}

export const LivePreview = ({
  code,
  showCode = true,
  preProps,
  className,
  defaultOpen = false,
}: LivePreviewProps) => {
  const [value, setValue] = useState(defaultOpen ? 'code' : '')
  const preRef = useRef<HTMLPreElement>(null!)

  const template = `
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

  /**
   * TODO: make this instant on initial mount
   */
  useEffect(() => {
    api.start({
      height: value === '' ? 0 : preRef.current.getBoundingClientRect().height,
    })
  }, [value])

  return (
    <PreviewContainer className={className}>
      <SandpackProvider
        template="react"
        files={{
          '/App.js': {
            code: template,
          },
          '/index.css': {
            code: /* css */ `
                    html, body {
                        height: 100%;
                    }

                    body {
                        display:flex;
                        align-items: center;
                        margin: 0 25px;
                    }

                    .spring-box {
                      width: 80px;
                      height: 80px;
                      background-color: #ff6d6d;
                      border-radius: 8px;
                      font-family: Helvetica;
                      font-size: 14px;
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      color: #1B1A22;
                    }
                `,
          },
        }}
        customSetup={{
          dependencies: {
            '@react-spring/web': '*',
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
        }}>
        <SandpackPreview />
      </SandpackProvider>
      {showCode ? (
        <Accordion.Root
          type="single"
          collapsible
          value={value}
          onValueChange={handleValueChange}>
          <Accordion.Item value="code">
            <AccordionHeader>
              <Accordion.Trigger asChild>
                <AccordionTrigger>
                  {value === '' ? 'Show Code' : 'Hide Code'}
                </AccordionTrigger>
              </Accordion.Trigger>
            </AccordionHeader>
            <AccordionContent style={styles} forceMount>
              <Pre ref={preRef} {...preProps} />
            </AccordionContent>
          </Accordion.Item>
        </Accordion.Root>
      ) : null}
    </PreviewContainer>
  )
}

const PreviewContainer = styled('div', {
  width: '100%',
  my: '$40',

  '& .preview__wrapper': {
    mb: '$5',
  },

  '& .preview__overlay': {
    display: 'none',
  },

  '& .preview__layout, & .preview__stack, & .preview__container': {
    height: '100%',
    width: '100%',
  },

  '& .preview__container': {
    position: 'relative',
    backgroundColor: 'transparent',
  },

  '& .preview__actions': {
    position: 'absolute',
    bottom: '$10',
    right: '$10',
    display: 'flex',
    gap: '0.5rem',
  },

  '& .preview__button': {
    border: 'none',
    color: '$black',
    backgroundColor: '$codeBackground',
    cursor: 'pointer',
    margin: 0,
    padding: '0.5rem',
    height: '3rem',
    width: '3rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '$r8',

    '@motion': {
      transition: 'background-color 400ms',
    },

    hover: {
      backgroundColor: '$steel20',
      color: '$black !important',
    },
  },

  [`.${dark} &`]: {
    '.preview__button.sp-csb-icon-light': {
      color: '$white',
    },
  },

  '& .preview__iframe': {
    width: '100%',
    border: 'solid 1px $steel20',
    borderRadius: '$r8',
    height: 'inherit !important',
  },
})

const AccordionHeader = styled(Accordion.Header, {
  backgroundColor: '$codeBackground',
  padding: '$15 $30',
  display: 'flex',
  justifyContent: 'flex-end',
  borderRadius: '$r8',

  ['&[data-state=open]']: {
    borderRadius: '$r8 $r8 0 0',
  },
})

const AccordionTrigger = styled(Button, {
  fontFamily: '$mono',
})

const AccordionContent = styled(animated(Accordion.Content), {
  overflow: 'hidden',

  [`${Pre}`]: {
    pt: '0',
  },

  [`&[data-state=open] ${Pre}`]: {
    borderRadius: '0 0 $r8 $r8',
  },
})
