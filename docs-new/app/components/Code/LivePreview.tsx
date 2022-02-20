import { SandpackRunner } from '@codesandbox/sandpack-react'
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
  const template = `
    import { useSpring, animated } from '@react-spring/web'
    import '/index.css'

    export default function(){
      ${code}
    }
  `

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
      <Pre {...preProps} />
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
    backgroundColor: '#f0f2f4',
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
