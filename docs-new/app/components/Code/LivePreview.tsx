import { useRef, useState } from 'react'
import { SandpackRunner } from '@codesandbox/sandpack-react'
import * as Accordion from '@radix-ui/react-accordion'
import { animated, useSpring } from '@react-spring/web'

import { styled } from '~/styles/stitches.config'

import { Pre } from './Pre'

interface LivePreviewProps {
  code: string
  preProps: {
    id?: string
    showLineNumbers: boolean
    ['data-showing-lines']: boolean
  }
}

export const LivePreview = ({ code, preProps }: LivePreviewProps) => {
  const [value, setValue] = useState('')
  const preRef = useRef<HTMLPreElement>(null!)

  const template = `
    import { useSpring, animated } from '@react-spring/web'
    import '/index.css'

    export default function(){
      ${code}
    }
  `

  const handleValueChange = (value: string) => setValue(value)

  const [styles] = useSpring(
    () => ({
      height: value === '' ? 0 : preRef.current.getBoundingClientRect().height,
    }),
    [value]
  )

  return (
    <PreviewContainer>
      <SandpackRunner
        code={template}
        template="react"
        customSetup={{
          files: {
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
                    `,
            },
          },
          dependencies: {
            '@react-spring/web': '9.4.0-beta.1',
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
      />
      <Accordion.Root
        type="single"
        collapsible
        value={value}
        onValueChange={handleValueChange}>
        <Accordion.Item value="code">
          <AccordionHeader>
            <AccordionTrigger>
              {value === '' ? 'Show Code' : 'Hide Code'}
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionContent style={styles} forceMount>
            <Pre ref={preRef} {...preProps} />
          </AccordionContent>
        </Accordion.Item>
      </Accordion.Root>
    </PreviewContainer>
  )
}

const PreviewContainer = styled('div', {
  width: '100%',

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
    transition: 'background-color 400ms',

    '@media (hover: hover)': {
      '&:hover': {
        backgroundColor: '$steel20',
      },
    },
  },

  '& .preview__iframe': {
    width: '100%',
    border: 'solid 1px $grey',
    borderRadius: '$r8',
    height: 'inherit !important',
  },
})

const AccordionHeader = styled(Accordion.Header, {
  backgroundColor: '$codeBackground',
  padding: '$15 $30',
  display: 'flex',
  justifyContent: 'flex-end',
})

const AccordionTrigger = styled(Accordion.Trigger, {
  border: 'solid 1px $codeText',
  backgroundColor: 'transparent',
  borderRadius: '$r4',
  fontFamily: '$mono',
  fontSize: '$XXS',
  lineHeight: '$code',
  padding: '5px $10',
})

const AccordionContent = styled(animated(Accordion.Content), {
  overflow: 'hidden',

  [`${Pre}`]: {
    pt: '0',
  },
})
